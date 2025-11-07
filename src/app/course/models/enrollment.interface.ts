export interface Enrollment {
  id?: number;
  userId: number;
  courseId: number;
  enrolledDate: Date;
  status: 'active' | 'completed' | 'dropped';
  progress: number; // percentage
  lastAccessedDate?: Date;
  completedDate?: Date;
  certificateUrl?: string;
}
