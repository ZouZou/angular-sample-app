export interface UserProgress {
  id?: number;
  userId: number;
  enrollmentId: number;
  lessonId: number;
  completed: boolean;
  completedDate?: Date;
  timeSpent?: number; // in minutes
  notes?: string;
  watchPercentage?: number; // 0-100
  currentPosition?: number; // in seconds
  lastWatchedAt?: Date;
  playbackSpeed?: number; // 0.5 - 2.0
}
