export interface Quiz {
  id?: number;
  lessonId?: number;
  courseId: number;
  title: string;
  description?: string;
  passingScore: number; // percentage
  timeLimit?: number; // in minutes
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id?: number;
  quizId: number;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'multi-select';
  order: number;
  points: number;
  options: QuizOption[];
  explanation?: string;
}

export interface QuizOption {
  id?: number;
  questionId: number;
  text: string;
  isCorrect: boolean;
  order: number;
}

export interface QuizAttempt {
  id?: number;
  userId: number;
  enrollmentId: number;
  quizId: number;
  attemptNumber: number;
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  startedAt: Date;
  completedAt?: Date;
  answers: UserAnswer[];
}

export interface UserAnswer {
  id?: number;
  attemptId: number;
  questionId: number;
  selectedOptionIds: number[];
  isCorrect: boolean;
  pointsEarned: number;
}
