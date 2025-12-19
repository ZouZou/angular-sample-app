import { AppDataSource } from '../config/database';
import { Enrollment } from '../entities/Enrollment';
import { User } from '../entities/User';
import { Course } from '../entities/Course';
import { UserProgress } from '../entities/UserProgress';
import { QuizAttempt } from '../entities/QuizAttempt';
import { Quiz } from '../entities/Quiz';
import { UserAnswer } from '../entities/UserAnswer';
import { QuizQuestion } from '../entities/QuizQuestion';
import { Lesson } from '../entities/Lesson';
import { CourseSection } from '../entities/CourseSection';
import { AppError } from '../middleware/errorHandler';

export interface CourseAnalytics {
  courseId: number;
  courseTitle: string;
  totalEnrolled: number;
  activeStudents: number;
  completedStudents: number;
  droppedStudents: number;
  averageProgress: number;
  completionRate: number;
  dropoutRate: number;
  averageQuizScore: number | null;
  quizPassRate: number | null;
}

export interface StudentEnrollmentData {
  userId: number;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  enrollmentId: number;
  enrolledDate: Date;
  lastAccessedDate?: Date;
  status: 'active' | 'completed' | 'dropped';
  progress: number;
  completedLessons: number;
  totalLessons: number;
  averageQuizScore: number | null;
  quizzesTaken: number;
  totalQuizzes: number;
  timeSpent: number;
}

export interface QuizPerformanceData {
  quizId: number;
  quizTitle: string;
  totalAttempts: number;
  averageScore: number;
  passRate: number;
  questionAnalytics: QuestionAnalytics[];
}

export interface QuestionAnalytics {
  questionId: number;
  questionText: string;
  totalAttempts: number;
  correctAttempts: number;
  incorrectAttempts: number;
  accuracyRate: number;
}

export interface StudentDetailData {
  user: User;
  enrollment: Enrollment;
  progressRecords: UserProgress[];
  quizAttempts: QuizAttempt[];
  totalTimeSpent: number;
  completionPercentage: number;
}

export class InstructorService {
  private enrollmentRepository = AppDataSource.getRepository(Enrollment);
  private userRepository = AppDataSource.getRepository(User);
  private courseRepository = AppDataSource.getRepository(Course);
  private progressRepository = AppDataSource.getRepository(UserProgress);
  private quizAttemptRepository = AppDataSource.getRepository(QuizAttempt);
  private quizRepository = AppDataSource.getRepository(Quiz);
  private userAnswerRepository = AppDataSource.getRepository(UserAnswer);
  private quizQuestionRepository = AppDataSource.getRepository(QuizQuestion);
  private lessonRepository = AppDataSource.getRepository(Lesson);
  private sectionRepository = AppDataSource.getRepository(CourseSection);

  async getCourseAnalytics(courseId: number): Promise<CourseAnalytics> {
    // Verify course exists
    const course = await this.courseRepository.findOne({ where: { id: courseId } });
    if (!course) {
      throw new AppError('Course not found', 404);
    }

    // Get all enrollments for the course
    const enrollments = await this.enrollmentRepository.find({
      where: { courseId }
    });

    const totalEnrolled = enrollments.length;
    const activeStudents = enrollments.filter(e => e.status === 'active').length;
    const completedStudents = enrollments.filter(e => e.status === 'completed').length;
    const droppedStudents = enrollments.filter(e => e.status === 'dropped').length;

    // Calculate average progress
    const averageProgress = totalEnrolled > 0
      ? enrollments.reduce((sum, e) => sum + e.progress, 0) / totalEnrolled
      : 0;

    // Calculate rates
    const completionRate = totalEnrolled > 0
      ? (completedStudents / totalEnrolled) * 100
      : 0;
    const dropoutRate = totalEnrolled > 0
      ? (droppedStudents / totalEnrolled) * 100
      : 0;

    // Get quiz analytics
    const quizzes = await this.quizRepository.find({ where: { courseId } });
    const totalQuizzes = quizzes.length;

    let averageQuizScore: number | null = null;
    let quizPassRate: number | null = null;

    if (totalQuizzes > 0) {
      const quizAttempts = await this.quizAttemptRepository
        .createQueryBuilder('attempt')
        .innerJoin('attempt.quiz', 'quiz')
        .where('quiz.courseId = :courseId', { courseId })
        .getMany();

      if (quizAttempts.length > 0) {
        averageQuizScore = quizAttempts.reduce((sum, a) => sum + Number(a.percentage), 0) / quizAttempts.length;
        const passedAttempts = quizAttempts.filter(a => a.passed).length;
        quizPassRate = (passedAttempts / quizAttempts.length) * 100;
      }
    }

    return {
      courseId,
      courseTitle: course.title,
      totalEnrolled,
      activeStudents,
      completedStudents,
      droppedStudents,
      averageProgress: Math.round(averageProgress * 100) / 100,
      completionRate: Math.round(completionRate * 100) / 100,
      dropoutRate: Math.round(dropoutRate * 100) / 100,
      averageQuizScore: averageQuizScore !== null ? Math.round(averageQuizScore * 100) / 100 : null,
      quizPassRate: quizPassRate !== null ? Math.round(quizPassRate * 100) / 100 : null
    };
  }

  async getCourseStudents(courseId: number): Promise<StudentEnrollmentData[]> {
    // Verify course exists
    const course = await this.courseRepository.findOne({ where: { id: courseId } });
    if (!course) {
      throw new AppError('Course not found', 404);
    }

    // Get all lessons in the course
    const sections = await this.sectionRepository.find({
      where: { courseId },
      relations: ['lessons']
    });
    const totalLessons = sections.reduce((sum, section) => sum + (section.lessons?.length || 0), 0);

    // Get total quizzes for the course
    const totalQuizzes = await this.quizRepository.count({ where: { courseId } });

    // Get enrollments with user data
    const enrollments = await this.enrollmentRepository.find({
      where: { courseId },
      relations: ['user'],
      order: { enrolledAt: 'DESC' }
    });

    const studentData: StudentEnrollmentData[] = [];

    for (const enrollment of enrollments) {
      // Get completed lessons count
      const completedLessons = await this.progressRepository.count({
        where: {
          enrollmentId: enrollment.id,
          completed: true
        }
      });

      // Get total time spent
      const progressRecords = await this.progressRepository.find({
        where: { enrollmentId: enrollment.id }
      });
      const timeSpent = progressRecords.reduce((sum, p) => sum + p.timeSpent, 0);

      // Get quiz attempts
      const quizAttempts = await this.quizAttemptRepository.find({
        where: { enrollmentId: enrollment.id }
      });

      const quizzesTaken = quizAttempts.length;
      const averageQuizScore = quizzesTaken > 0
        ? quizAttempts.reduce((sum, a) => sum + Number(a.percentage), 0) / quizzesTaken
        : null;

      studentData.push({
        userId: enrollment.user.id,
        userName: enrollment.user.name,
        userEmail: enrollment.user.email,
        userAvatar: enrollment.user.avatarUrl,
        enrollmentId: enrollment.id,
        enrolledDate: enrollment.enrolledAt,
        lastAccessedDate: enrollment.lastAccessedAt,
        status: enrollment.status as 'active' | 'completed' | 'dropped',
        progress: enrollment.progress,
        completedLessons,
        totalLessons,
        averageQuizScore: averageQuizScore !== null ? Math.round(averageQuizScore * 100) / 100 : null,
        quizzesTaken,
        totalQuizzes,
        timeSpent
      });
    }

    return studentData;
  }

  async getQuizPerformanceAnalytics(courseId: number): Promise<QuizPerformanceData[]> {
    // Verify course exists
    const course = await this.courseRepository.findOne({ where: { id: courseId } });
    if (!course) {
      throw new AppError('Course not found', 404);
    }

    // Get all quizzes for the course
    const quizzes = await this.quizRepository.find({
      where: { courseId },
      relations: ['questions']
    });

    const quizPerformanceData: QuizPerformanceData[] = [];

    for (const quiz of quizzes) {
      // Get all attempts for this quiz
      const attempts = await this.quizAttemptRepository.find({
        where: { quizId: quiz.id }
      });

      const totalAttempts = attempts.length;
      const averageScore = totalAttempts > 0
        ? attempts.reduce((sum, a) => sum + Number(a.percentage), 0) / totalAttempts
        : 0;
      const passedAttempts = attempts.filter(a => a.passed).length;
      const passRate = totalAttempts > 0 ? (passedAttempts / totalAttempts) * 100 : 0;

      // Get question-level analytics
      const questionAnalytics: QuestionAnalytics[] = [];

      for (const question of quiz.questions) {
        // Get all user answers for this question
        const userAnswers = await this.userAnswerRepository
          .createQueryBuilder('answer')
          .innerJoin('answer.attempt', 'attempt')
          .where('answer.questionId = :questionId', { questionId: question.id })
          .andWhere('attempt.quizId = :quizId', { quizId: quiz.id })
          .getMany();

        const totalAttempts = userAnswers.length;
        const correctAttempts = userAnswers.filter(a => a.isCorrect).length;
        const incorrectAttempts = totalAttempts - correctAttempts;
        const accuracyRate = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;

        questionAnalytics.push({
          questionId: question.id,
          questionText: question.question,
          totalAttempts,
          correctAttempts,
          incorrectAttempts,
          accuracyRate: Math.round(accuracyRate * 100) / 100
        });
      }

      quizPerformanceData.push({
        quizId: quiz.id,
        quizTitle: quiz.title,
        totalAttempts,
        averageScore: Math.round(averageScore * 100) / 100,
        passRate: Math.round(passRate * 100) / 100,
        questionAnalytics
      });
    }

    return quizPerformanceData;
  }

  async getStudentDetailedPerformance(studentId: number, courseId: number): Promise<StudentDetailData> {
    // Get enrollment
    const enrollment = await this.enrollmentRepository.findOne({
      where: { userId: studentId, courseId },
      relations: ['user', 'course']
    });

    if (!enrollment) {
      throw new AppError('Enrollment not found', 404);
    }

    // Get user
    const user = await this.userRepository.findOne({ where: { id: studentId } });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Get all progress records
    const progressRecords = await this.progressRepository.find({
      where: { enrollmentId: enrollment.id },
      relations: ['lesson'],
      order: { createdAt: 'DESC' }
    });

    // Get all quiz attempts
    const quizAttempts = await this.quizAttemptRepository.find({
      where: { enrollmentId: enrollment.id },
      relations: ['quiz'],
      order: { startedAt: 'DESC' }
    });

    // Calculate total time spent
    const totalTimeSpent = progressRecords.reduce((sum, p) => sum + p.timeSpent, 0);

    return {
      user,
      enrollment,
      progressRecords,
      quizAttempts,
      totalTimeSpent,
      completionPercentage: enrollment.progress
    };
  }

  async exportCourseData(courseId: number, format: 'csv' | 'json'): Promise<StudentEnrollmentData[]> {
    // Simply return the student data - formatting will be done on frontend
    return await this.getCourseStudents(courseId);
  }
}
