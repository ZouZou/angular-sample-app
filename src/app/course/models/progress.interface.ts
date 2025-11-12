export interface UserProgress {
  id?: number;
  userId: number;
  enrollmentId: number;
  lessonId: number;
  completed: boolean;
  completedDate?: Date;
  timeSpent?: number; // in minutes
  notes?: string;
}
