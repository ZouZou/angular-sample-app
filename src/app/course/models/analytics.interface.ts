import { User } from './user.interface';
import { Enrollment } from './enrollment.interface';
import { UserProgress } from './progress.interface';
import { QuizAttempt } from './quiz.interface';

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
