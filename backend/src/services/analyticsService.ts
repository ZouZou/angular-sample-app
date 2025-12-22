import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { Course } from '../entities/Course';
import { Enrollment } from '../entities/Enrollment';
import { QuizAttempt } from '../entities/QuizAttempt';
import { UserProgress } from '../entities/UserProgress';
import { AppError } from '../middleware/errorHandler';
import { Between, MoreThan } from 'typeorm';

interface TimeSeriesData {
  date: string;
  count: number;
}

interface CourseStats {
  courseId: number;
  courseTitle: string;
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  completionRate: number;
  averageProgress: number;
}

interface SystemOverview {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  totalQuizAttempts: number;
  averageQuizScore: number;
}

interface StudentAnalytics {
  totalCoursesEnrolled: number;
  completedCourses: number;
  activeCourses: number;
  totalQuizzesTaken: number;
  averageQuizScore: number;
  totalLessonsCompleted: number;
  learningStreak: number;
  progressOverTime: TimeSeriesData[];
  quizPerformanceOverTime: TimeSeriesData[];
}

export class AnalyticsService {
  private userRepository = AppDataSource.getRepository(User);
  private courseRepository = AppDataSource.getRepository(Course);
  private enrollmentRepository = AppDataSource.getRepository(Enrollment);
  private quizAttemptRepository = AppDataSource.getRepository(QuizAttempt);
  private progressRepository = AppDataSource.getRepository(UserProgress);

  /**
   * Get system-wide analytics overview
   */
  async getSystemOverview(): Promise<SystemOverview> {
    const [
      totalUsers,
      totalCourses,
      enrollments,
      quizAttempts
    ] = await Promise.all([
      this.userRepository.count(),
      this.courseRepository.count(),
      this.enrollmentRepository.find(),
      this.quizAttemptRepository.find({ where: { completedAt: MoreThan(new Date(0)) } })
    ]);

    const activeEnrollments = enrollments.filter(e => e.status === 'active').length;
    const completedEnrollments = enrollments.filter(e => e.status === 'completed').length;

    const averageQuizScore = quizAttempts.length > 0
      ? quizAttempts.reduce((sum, attempt) => sum + Number(attempt.percentage), 0) / quizAttempts.length
      : 0;

    return {
      totalUsers,
      totalCourses,
      totalEnrollments: enrollments.length,
      activeEnrollments,
      completedEnrollments,
      totalQuizAttempts: quizAttempts.length,
      averageQuizScore: Math.round(averageQuizScore * 100) / 100
    };
  }

  /**
   * Get user growth over time
   */
  async getUserGrowthOverTime(days: number = 30): Promise<TimeSeriesData[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const users = await this.userRepository.find({
      where: { createdAt: MoreThan(startDate) },
      order: { createdAt: 'ASC' }
    });

    // Group by date
    const growthMap = new Map<string, number>();
    let cumulativeCount = await this.userRepository.count({
      where: { createdAt: Between(new Date(0), startDate) }
    });

    users.forEach(user => {
      const date = user.createdAt.toISOString().split('T')[0];
      cumulativeCount++;
      growthMap.set(date, cumulativeCount);
    });

    return Array.from(growthMap.entries()).map(([date, count]) => ({
      date,
      count
    }));
  }

  /**
   * Get enrollment trends over time
   */
  async getEnrollmentTrends(days: number = 30): Promise<TimeSeriesData[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const enrollments = await this.enrollmentRepository.find({
      where: { enrolledAt: MoreThan(startDate) },
      order: { enrolledAt: 'ASC' }
    });

    // Group by date
    const trendsMap = new Map<string, number>();
    enrollments.forEach(enrollment => {
      const date = enrollment.enrolledAt.toISOString().split('T')[0];
      trendsMap.set(date, (trendsMap.get(date) || 0) + 1);
    });

    return Array.from(trendsMap.entries()).map(([date, count]) => ({
      date,
      count
    }));
  }

  /**
   * Get top performing courses
   */
  async getTopCourses(limit: number = 10): Promise<CourseStats[]> {
    const courses = await this.courseRepository.find({
      relations: ['enrollments']
    });

    const courseStats = await Promise.all(
      courses.map(async course => {
        const enrollments = course.enrollments || [];
        const totalEnrollments = enrollments.length;
        const activeEnrollments = enrollments.filter(e => e.status === 'active').length;
        const completedEnrollments = enrollments.filter(e => e.status === 'completed').length;
        const completionRate = totalEnrollments > 0
          ? (completedEnrollments / totalEnrollments) * 100
          : 0;

        const averageProgress = enrollments.length > 0
          ? enrollments.reduce((sum, e) => sum + Number(e.progress), 0) / enrollments.length
          : 0;

        return {
          courseId: course.id!,
          courseTitle: course.title,
          totalEnrollments,
          activeEnrollments,
          completedEnrollments,
          completionRate: Math.round(completionRate * 100) / 100,
          averageProgress: Math.round(averageProgress * 100) / 100
        };
      })
    );

    // Sort by total enrollments
    return courseStats
      .sort((a, b) => b.totalEnrollments - a.totalEnrollments)
      .slice(0, limit);
  }

  /**
   * Get student personal analytics
   */
  async getStudentAnalytics(userId: number): Promise<StudentAnalytics> {
    const enrollments = await this.enrollmentRepository.find({
      where: { userId },
      order: { enrolledAt: 'ASC' }
    });

    const quizAttempts = await this.quizAttemptRepository.find({
      where: { userId, completedAt: MoreThan(new Date(0)) },
      order: { completedAt: 'ASC' }
    });

    const progress = await this.progressRepository.find({
      where: { userId, completed: true }
    });

    const totalCoursesEnrolled = enrollments.length;
    const completedCourses = enrollments.filter(e => e.status === 'completed').length;
    const activeCourses = enrollments.filter(e => e.status === 'active').length;

    const averageQuizScore = quizAttempts.length > 0
      ? quizAttempts.reduce((sum, attempt) => sum + Number(attempt.percentage), 0) / quizAttempts.length
      : 0;

    // Calculate learning streak (consecutive days with progress)
    const learningStreak = this.calculateLearningStreak(progress);

    // Progress over time
    const progressOverTime = this.aggregateProgressOverTime(enrollments);

    // Quiz performance over time
    const quizPerformanceOverTime = this.aggregateQuizPerformanceOverTime(quizAttempts);

    return {
      totalCoursesEnrolled,
      completedCourses,
      activeCourses,
      totalQuizzesTaken: quizAttempts.length,
      averageQuizScore: Math.round(averageQuizScore * 100) / 100,
      totalLessonsCompleted: progress.length,
      learningStreak,
      progressOverTime,
      quizPerformanceOverTime
    };
  }

  /**
   * Get course completion rate trends
   */
  async getCourseCompletionRates(): Promise<Array<{ courseName: string; completionRate: number }>> {
    const courses = await this.courseRepository.find({
      relations: ['enrollments']
    });

    return courses
      .map(course => {
        const enrollments = course.enrollments || [];
        const total = enrollments.length;
        const completed = enrollments.filter(e => e.status === 'completed').length;
        const completionRate = total > 0 ? (completed / total) * 100 : 0;

        return {
          courseName: course.title,
          completionRate: Math.round(completionRate * 100) / 100
        };
      })
      .filter(item => item.completionRate > 0)
      .sort((a, b) => b.completionRate - a.completionRate);
  }

  /**
   * Get quiz performance distribution
   */
  async getQuizPerformanceDistribution(): Promise<Array<{ range: string; count: number }>> {
    const attempts = await this.quizAttemptRepository.find({
      where: { completedAt: MoreThan(new Date(0)) }
    });

    const distribution = {
      '0-20': 0,
      '21-40': 0,
      '41-60': 0,
      '61-80': 0,
      '81-100': 0
    };

    attempts.forEach(attempt => {
      const percentage = Number(attempt.percentage);
      if (percentage <= 20) distribution['0-20']++;
      else if (percentage <= 40) distribution['21-40']++;
      else if (percentage <= 60) distribution['41-60']++;
      else if (percentage <= 80) distribution['61-80']++;
      else distribution['81-100']++;
    });

    return Object.entries(distribution).map(([range, count]) => ({
      range,
      count
    }));
  }

  /**
   * Calculate learning streak
   */
  private calculateLearningStreak(progress: UserProgress[]): number {
    if (progress.length === 0) return 0;

    const sortedProgress = progress
      .filter(p => p.completedAt)
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());

    if (sortedProgress.length === 0) return 0;

    let streak = 1;
    let currentDate = new Date(sortedProgress[0].completedAt!);
    currentDate.setHours(0, 0, 0, 0);

    for (let i = 1; i < sortedProgress.length; i++) {
      const progressDate = new Date(sortedProgress[i].completedAt!);
      progressDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((currentDate.getTime() - progressDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        streak++;
        currentDate = progressDate;
      } else if (diffDays > 1) {
        break;
      }
    }

    return streak;
  }

  /**
   * Aggregate progress over time
   */
  private aggregateProgressOverTime(enrollments: Enrollment[]): TimeSeriesData[] {
    const progressMap = new Map<string, number>();

    enrollments.forEach(enrollment => {
      const date = enrollment.enrolledAt.toISOString().split('T')[0];
      const progress = Number(enrollment.progress);
      progressMap.set(date, (progressMap.get(date) || 0) + progress);
    });

    return Array.from(progressMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Aggregate quiz performance over time
   */
  private aggregateQuizPerformanceOverTime(attempts: QuizAttempt[]): TimeSeriesData[] {
    const performanceMap = new Map<string, { total: number; count: number }>();

    attempts.forEach(attempt => {
      if (attempt.completedAt) {
        const date = attempt.completedAt.toISOString().split('T')[0];
        const current = performanceMap.get(date) || { total: 0, count: 0 };
        performanceMap.set(date, {
          total: current.total + Number(attempt.percentage),
          count: current.count + 1
        });
      }
    });

    return Array.from(performanceMap.entries())
      .map(([date, data]) => ({
        date,
        count: Math.round((data.total / data.count) * 100) / 100
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}
