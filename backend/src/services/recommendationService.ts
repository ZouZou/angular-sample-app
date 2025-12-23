import { AppDataSource } from '../config/database';
import { Course } from '../entities/Course';
import { User } from '../entities/User';
import { Enrollment } from '../entities/Enrollment';
import { QuizAttempt } from '../entities/QuizAttempt';
import { UserProgress } from '../entities/UserProgress';
import { In, Not } from 'typeorm';
import { AnalyticsService } from './analyticsService';

// Enums and Interfaces
export enum ReasonType {
  POPULAR = 'popular',
  SAME_CATEGORY = 'same_category',
  NEXT_LEVEL = 'next_level',
  COLLABORATIVE = 'collaborative',
  SKILL_MATCH = 'skill_match',
  TRENDING = 'trending',
  INSTRUCTOR = 'instructor'
}

export interface Recommendation {
  course: Course;
  score: number;
  reason: string;
  reasonType: ReasonType;
  matchScore: number;
}

interface UserProfile {
  userId: number;
  enrolledCourses: Course[];
  completedCourses: Course[];
  activeCourses: Course[];
  enrolledCategories: string[];
  completedCategories: string[];
  averageQuizScore: number;
  quizScoresByCategory: Map<string, number>;
  highestCompletedLevel: 'Beginner' | 'Intermediate' | 'Advanced' | null;
  learningStreak: number;
  averageCourseDuration: number;
  favoriteInstructors: string[];
}

interface ScoreBreakdown {
  content: number;
  collaborative: number;
  performance: number;
  popularity: number;
  engagement: number;
  dominantFactor: string;
  metadata?: any;
}

// Cache storage
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

class Cache {
  private storage: Map<string, CacheEntry<any>> = new Map();

  set<T>(key: string, data: T, expiresIn: number): void {
    this.storage.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn
    });
  }

  get<T>(key: string): T | null {
    const entry = this.storage.get(key);
    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    if (age > entry.expiresIn) {
      this.storage.delete(key);
      return null;
    }

    return entry.data as T;
  }

  clear(): void {
    this.storage.clear();
  }
}

class RecommendationService {
  private courseRepository = AppDataSource.getRepository(Course);
  private userRepository = AppDataSource.getRepository(User);
  private enrollmentRepository = AppDataSource.getRepository(Enrollment);
  private quizAttemptRepository = AppDataSource.getRepository(QuizAttempt);
  private progressRepository = AppDataSource.getRepository(UserProgress);
  private analyticsService = new AnalyticsService();

  private cache = new Cache();
  private readonly USER_PROFILE_CACHE_TTL = 60 * 60 * 1000; // 1 hour
  private readonly CO_ENROLLMENT_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
  private readonly POPULAR_COURSES_CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

  // Scoring weights
  private readonly WEIGHTS = {
    content: 0.25,
    collaborative: 0.30,
    performance: 0.20,
    popularity: 0.15,
    engagement: 0.10
  };

  /**
   * Get personalized recommendations for a user
   */
  async getRecommendationsForUser(
    userId: number,
    options: { limit?: number; excludeEnrolled?: boolean } = {}
  ): Promise<Recommendation[]> {
    const { limit = 10, excludeEnrolled = true } = options;

    // Get user profile with all relevant data
    const userProfile = await this.getUserProfile(userId);

    // Get all published courses
    let allCourses = await this.courseRepository.find({
      where: { published: true },
      relations: ['enrollments']
    });

    // Exclude enrolled courses if requested
    if (excludeEnrolled && userProfile.enrolledCourses.length > 0) {
      const enrolledIds = userProfile.enrolledCourses.map(c => c.id);
      allCourses = allCourses.filter(c => !enrolledIds.includes(c.id));
    }

    // Calculate scores for each course
    const scoredCourses = await Promise.all(
      allCourses.map(async (course) => {
        const scores = await this.calculateCourseScore(course, userProfile);
        const finalScore = this.calculateFinalScore(scores);
        const reason = this.generateReason(course, userProfile, scores);

        return {
          course,
          score: finalScore,
          reason: reason.text,
          reasonType: reason.type,
          matchScore: finalScore,
          scoreBreakdown: scores
        };
      })
    );

    // Sort by score descending
    scoredCourses.sort((a, b) => b.score - a.score);

    // Apply diversification
    const diversified = this.diversifyRecommendations(scoredCourses, limit);

    return diversified.map(({ scoreBreakdown, ...rec }) => rec);
  }

  /**
   * Get similar courses based on a specific course
   */
  async getSimilarCourses(courseId: number, limit = 5): Promise<Recommendation[]> {
    const targetCourse = await this.courseRepository.findOne({
      where: { id: courseId }
    });

    if (!targetCourse) {
      return [];
    }

    // Find courses with same category and similar level
    const similarCourses = await this.courseRepository.find({
      where: {
        published: true,
        id: Not(courseId),
        category: targetCourse.category
      },
      relations: ['enrollments']
    });

    // Score based on similarity
    const scored = similarCourses.map(course => {
      let score = 0.5; // Base score for same category

      // Same level gets higher score
      if (course.level === targetCourse.level) {
        score += 0.3;
      }

      // Same instructor (instructor is a string field)
      if (course.instructor && targetCourse.instructor && course.instructor === targetCourse.instructor) {
        score += 0.2;
      }

      // Popularity boost
      const popularityScore = Math.min(course.enrollmentCount / 100, 0.2);
      score += popularityScore;

      return {
        course,
        score: Math.min(score, 1.0),
        reason: `Similar to "${targetCourse.title}"`,
        reasonType: ReasonType.SAME_CATEGORY,
        matchScore: score
      };
    });

    // Sort and limit
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit);
  }

  /**
   * Get next recommended course after completing a course
   */
  async getNextCourse(courseId: number, userId: number): Promise<Recommendation | null> {
    const completedCourse = await this.courseRepository.findOne({
      where: { id: courseId }
    });

    if (!completedCourse) {
      return null;
    }

    const userProfile = await this.getUserProfile(userId);

    // Strategy: Find next level course in same category
    let nextLevel: 'Beginner' | 'Intermediate' | 'Advanced' | null = null;
    if (completedCourse.level === 'Beginner') nextLevel = 'Intermediate';
    else if (completedCourse.level === 'Intermediate') nextLevel = 'Advanced';

    // Look for courses in same category, next level
    const query: any = {
      published: true,
      category: completedCourse.category,
      id: Not(In(userProfile.enrolledCourses.map(c => c.id)))
    };

    if (nextLevel) {
      query.level = nextLevel;
    }

    const candidates = await this.courseRepository.find({
      where: query,
      relations: ['enrollments'],
      order: { enrollmentCount: 'DESC', rating: 'DESC' },
      take: 5
    });

    if (candidates.length === 0) {
      return null;
    }

    // Pick the most popular/highest rated
    const nextCourse = candidates[0];

    return {
      course: nextCourse,
      score: 0.9,
      reason: nextLevel
        ? `Next level after "${completedCourse.title}"`
        : `Continue learning ${completedCourse.category}`,
      reasonType: nextLevel ? ReasonType.NEXT_LEVEL : ReasonType.SAME_CATEGORY,
      matchScore: 0.9
    };
  }

  /**
   * Get popular/trending courses
   */
  async getPopularCourses(limit = 10): Promise<Recommendation[]> {
    const cacheKey = `popular_courses_${limit}`;
    const cached = this.cache.get<Recommendation[]>(cacheKey);
    if (cached) return cached;

    const courses = await this.courseRepository.find({
      where: { published: true },
      relations: ['enrollments'],
      order: { enrollmentCount: 'DESC', rating: 'DESC' },
      take: limit * 2 // Get more to filter
    });

    const recommendations: Recommendation[] = courses.slice(0, limit).map(course => ({
      course,
      score: this.normalizeEnrollmentCount(course.enrollmentCount, courses),
      reason: 'Popular this week',
      reasonType: ReasonType.POPULAR,
      matchScore: course.enrollmentCount / 100
    }));

    this.cache.set(cacheKey, recommendations, this.POPULAR_COURSES_CACHE_TTL);
    return recommendations;
  }

  /**
   * Get comprehensive user profile with learning patterns
   */
  private async getUserProfile(userId: number): Promise<UserProfile> {
    const cacheKey = `user_profile_${userId}`;
    const cached = this.cache.get<UserProfile>(cacheKey);
    if (cached) return cached;

    // Get all enrollments
    const enrollments = await this.enrollmentRepository.find({
      where: { userId },
      relations: ['course']
    });

    const enrolledCourses = enrollments.map(e => e.course);
    const completedCourses = enrollments
      .filter(e => e.status === 'completed')
      .map(e => e.course);
    const activeCourses = enrollments
      .filter(e => e.status === 'active')
      .map(e => e.course);

    // Extract categories (filter out undefined)
    const enrolledCategories = [...new Set(enrolledCourses.map(c => c.category).filter((c): c is string => c !== undefined))];
    const completedCategories = [...new Set(completedCourses.map(c => c.category).filter((c): c is string => c !== undefined))];

    // Get quiz performance
    const quizAttempts = await this.quizAttemptRepository.find({
      where: { userId },
      relations: ['quiz', 'quiz.course']
    });

    const averageQuizScore = quizAttempts.length > 0
      ? quizAttempts.reduce((sum, a) => sum + a.percentage, 0) / quizAttempts.length
      : 0;

    // Quiz scores by category
    const quizScoresByCategory = new Map<string, number>();
    enrolledCategories.forEach(category => {
      const categoryAttempts = quizAttempts.filter(
        a => a.quiz?.course?.category === category
      );
      if (categoryAttempts.length > 0) {
        const avg = categoryAttempts.reduce((sum, a) => sum + a.percentage, 0) / categoryAttempts.length;
        quizScoresByCategory.set(category, avg);
      }
    });

    // Highest completed level
    let highestCompletedLevel: 'Beginner' | 'Intermediate' | 'Advanced' | null = null;
    if (completedCourses.some(c => c.level === 'Advanced')) {
      highestCompletedLevel = 'Advanced';
    } else if (completedCourses.some(c => c.level === 'Intermediate')) {
      highestCompletedLevel = 'Intermediate';
    } else if (completedCourses.some(c => c.level === 'Beginner')) {
      highestCompletedLevel = 'Beginner';
    }

    // Get learning streak from analytics
    let learningStreak = 0;
    try {
      const analytics = await this.analyticsService.getStudentAnalytics(userId);
      learningStreak = analytics.learningStreak;
    } catch (error) {
      console.error('Error fetching learning streak:', error);
    }

    // Average course duration
    const averageCourseDuration = enrolledCourses.length > 0
      ? enrolledCourses.reduce((sum, c) => sum + (c.duration || 0), 0) / enrolledCourses.length
      : 0;

    // Favorite instructors (by completed courses)
    const instructorCounts = new Map<string, number>();
    completedCourses.forEach(course => {
      if (course.instructor) {
        const name = course.instructor; // instructor is a string field
        instructorCounts.set(name, (instructorCounts.get(name) || 0) + 1);
      }
    });
    const favoriteInstructors = Array.from(instructorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name]) => name);

    const profile: UserProfile = {
      userId,
      enrolledCourses,
      completedCourses,
      activeCourses,
      enrolledCategories,
      completedCategories,
      averageQuizScore,
      quizScoresByCategory,
      highestCompletedLevel,
      learningStreak,
      averageCourseDuration,
      favoriteInstructors
    };

    this.cache.set(cacheKey, profile, this.USER_PROFILE_CACHE_TTL);
    return profile;
  }

  /**
   * Calculate all scoring components for a course
   */
  private async calculateCourseScore(
    course: Course,
    userProfile: UserProfile
  ): Promise<ScoreBreakdown> {
    const [contentScore, collaborativeScore, performanceScore] = await Promise.all([
      this.calculateContentScore(course, userProfile),
      this.calculateCollaborativeScore(course, userProfile),
      this.calculatePerformanceScore(course, userProfile)
    ]);

    const popularityScore = this.calculatePopularityScore(course);
    const engagementScore = this.calculateEngagementScore(course, userProfile);

    // Determine dominant factor
    const scores = {
      content: contentScore,
      collaborative: collaborativeScore,
      performance: performanceScore,
      popularity: popularityScore,
      engagement: engagementScore
    };

    const dominantFactor = Object.entries(scores).reduce((a, b) =>
      b[1] > a[1] ? b : a
    )[0];

    return {
      ...scores,
      dominantFactor,
      metadata: { category: course.category, level: course.level }
    };
  }

  /**
   * Content-based filtering score
   */
  private async calculateContentScore(
    course: Course,
    userProfile: UserProfile
  ): Promise<number> {
    let score = 0;

    // Category match (0.4 weight within content score)
    if (course.category && userProfile.completedCategories.includes(course.category)) {
      score += 0.4; // Completed courses in this category
    } else if (course.category && userProfile.enrolledCategories.includes(course.category)) {
      score += 0.25; // Currently enrolled in this category
    }

    // Level progression (0.6 weight within content score)
    if (course.level) {
      const levelScore = this.getLevelProgressionScore(course.level, userProfile);
      score += levelScore * 0.6;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Calculate level progression score
   */
  private getLevelProgressionScore(
    courseLevel: 'Beginner' | 'Intermediate' | 'Advanced',
    userProfile: UserProfile
  ): number {
    if (!userProfile.highestCompletedLevel) {
      // New user - recommend Beginner
      return courseLevel === 'Beginner' ? 1.0 : 0.3;
    }

    const levelOrder = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 };
    const userLevel = levelOrder[userProfile.highestCompletedLevel];
    const targetLevel = levelOrder[courseLevel];

    if (targetLevel === userLevel + 1) {
      return 1.0; // Next level - perfect match
    } else if (targetLevel === userLevel) {
      return 0.7; // Same level - good for reinforcement
    } else if (targetLevel > userLevel + 1) {
      return 0.4; // Too advanced
    } else {
      return 0.3; // Below current level
    }
  }

  /**
   * Collaborative filtering score
   */
  private async calculateCollaborativeScore(
    course: Course,
    userProfile: UserProfile
  ): Promise<number> {
    if (userProfile.completedCourses.length === 0) {
      return 0; // No data for collaborative filtering
    }

    // Find users who completed same courses
    const completedIds = userProfile.completedCourses.map(c => c.id);

    const similarUserEnrollments = await this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .where('enrollment.courseId IN (:...completedIds)', { completedIds })
      .andWhere('enrollment.userId != :userId', { userId: userProfile.userId })
      .andWhere('enrollment.status = :status', { status: 'completed' })
      .select('enrollment.userId')
      .distinct(true)
      .getRawMany();

    if (similarUserEnrollments.length === 0) {
      return 0;
    }

    const similarUserIds = similarUserEnrollments.map(e => e.userId);

    // Count how many similar users enrolled in this course
    const coEnrollmentCount = await this.enrollmentRepository.count({
      where: {
        courseId: course.id,
        userId: In(similarUserIds)
      }
    });

    // Normalize by number of similar users
    return Math.min(coEnrollmentCount / similarUserIds.length, 1.0);
  }

  /**
   * Performance-based score (quiz scores → difficulty matching)
   */
  private async calculatePerformanceScore(
    course: Course,
    userProfile: UserProfile
  ): Promise<number> {
    const avgQuiz = userProfile.averageQuizScore;

    // If no quiz history, use neutral score
    if (avgQuiz === 0) {
      return 0.5;
    }

    // Match difficulty to quiz performance
    if (avgQuiz >= 85) {
      // High performer - recommend Advanced
      if (course.level === 'Advanced') return 1.0;
      if (course.level === 'Intermediate') return 0.6;
      return 0.4;
    } else if (avgQuiz >= 70) {
      // Good performer - recommend Intermediate
      if (course.level === 'Intermediate') return 1.0;
      if (course.level === 'Advanced') return 0.6;
      return 0.5;
    } else {
      // Needs reinforcement - recommend Beginner
      if (course.level === 'Beginner') return 1.0;
      if (course.level === 'Intermediate') return 0.5;
      return 0.3;
    }
  }

  /**
   * Popularity-based score
   */
  private calculatePopularityScore(course: Course): number {
    let score = 0;

    // Enrollment count (0.4 weight)
    const enrollmentScore = Math.min(course.enrollmentCount / 100, 0.4);
    score += enrollmentScore;

    // Rating (0.6 weight)
    const ratingScore = ((course.rating || 0) / 5.0) * 0.6;
    score += ratingScore;

    return Math.min(score, 1.0);
  }

  /**
   * Engagement-based score
   */
  private calculateEngagementScore(
    course: Course,
    userProfile: UserProfile
  ): number {
    let score = 0;

    // Learning streak bonus (0.5 weight)
    if (userProfile.learningStreak >= 7) {
      score += 0.5; // Active learner - boost newer/trending courses
    } else if (userProfile.learningStreak >= 3) {
      score += 0.3;
    }

    // Course duration matching (0.5 weight)
    if (userProfile.averageCourseDuration > 0 && course.duration) {
      const durationDiff = Math.abs(course.duration - userProfile.averageCourseDuration);
      const durationRatio = durationDiff / userProfile.averageCourseDuration;

      if (durationRatio <= 0.3) {
        score += 0.5; // Within 30% of user's typical course duration
      } else if (durationRatio <= 0.5) {
        score += 0.3;
      }
    }

    return Math.min(score, 1.0);
  }

  /**
   * Calculate final weighted score
   */
  private calculateFinalScore(scores: ScoreBreakdown): number {
    return (
      scores.content * this.WEIGHTS.content +
      scores.collaborative * this.WEIGHTS.collaborative +
      scores.performance * this.WEIGHTS.performance +
      scores.popularity * this.WEIGHTS.popularity +
      scores.engagement * this.WEIGHTS.engagement
    );
  }

  /**
   * Generate human-readable reason for recommendation
   */
  private generateReason(
    course: Course,
    userProfile: UserProfile,
    scores: ScoreBreakdown
  ): { text: string; type: ReasonType } {
    const dominant = scores.dominantFactor;

    switch (dominant) {
      case 'collaborative':
        return {
          text: 'Students with similar interests took this',
          type: ReasonType.COLLABORATIVE
        };

      case 'content':
        if (course.category && userProfile.completedCategories.includes(course.category)) {
          const lastCompleted = userProfile.completedCourses
            .filter(c => c.category === course.category)
            .pop();
          return {
            text: lastCompleted
              ? `Because you completed "${lastCompleted.title}"`
              : `Popular in ${course.category}`,
            type: ReasonType.SAME_CATEGORY
          };
        }
        return {
          text: course.category ? `Explore ${course.category}` : 'Recommended for you',
          type: ReasonType.SAME_CATEGORY
        };

      case 'performance':
        const skillLevel =
          userProfile.averageQuizScore >= 85 ? 'advanced' :
          userProfile.averageQuizScore >= 70 ? 'intermediate' : 'beginner';
        return {
          text: `Matches your ${skillLevel} skill level`,
          type: ReasonType.SKILL_MATCH
        };

      case 'popularity':
        return {
          text: 'Trending this week',
          type: ReasonType.TRENDING
        };

      case 'engagement':
        if (course.instructor && userProfile.favoriteInstructors.includes(course.instructor)) {
          return {
            text: `From instructor ${course.instructor}`,
            type: ReasonType.INSTRUCTOR
          };
        }
        return {
          text: 'Popular this week',
          type: ReasonType.POPULAR
        };

      default:
        return {
          text: 'Recommended for you',
          type: ReasonType.POPULAR
        };
    }
  }

  /**
   * Diversify recommendations to avoid filter bubbles
   */
  private diversifyRecommendations(
    recommendations: any[],
    limit: number
  ): any[] {
    const result: any[] = [];
    const categoryCounts = new Map<string, number>();
    const instructorCounts = new Map<string, number>();

    for (const rec of recommendations) {
      if (result.length >= limit) break;

      const category = rec.course.category;
      const instructor = rec.course.instructor?.name || 'Unknown';

      const categoryCount = categoryCounts.get(category) || 0;
      const instructorCount = instructorCounts.get(instructor) || 0;

      // Max 3 per category, max 2 per instructor
      if (categoryCount < 3 && instructorCount < 2) {
        result.push(rec);
        categoryCounts.set(category, categoryCount + 1);
        instructorCounts.set(instructor, instructorCount + 1);
      }
    }

    // If we didn't fill the limit due to diversity constraints, add remaining
    if (result.length < limit) {
      for (const rec of recommendations) {
        if (result.length >= limit) break;
        if (!result.includes(rec)) {
          result.push(rec);
        }
      }
    }

    return result;
  }

  /**
   * Normalize enrollment count for scoring
   */
  private normalizeEnrollmentCount(count: number, allCourses: Course[]): number {
    const counts = allCourses.map(c => c.enrollmentCount);
    const min = Math.min(...counts);
    const max = Math.max(...counts);

    if (max === min) return 0.5;

    return 0.5 + ((count - min) / (max - min)) * 0.5; // Scale to 0.5-1.0
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.cache.clear();
  }
}

export const recommendationService = new RecommendationService();
