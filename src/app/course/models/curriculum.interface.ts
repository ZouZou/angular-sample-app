export interface CourseSection {
  id?: number;
  courseId: number;
  title: string;
  description?: string;
  order: number;
  lessons: Lesson[];
}

export interface Lesson {
  id?: number;
  sectionId: number;
  title: string;
  description?: string;
  order: number;
  type: 'video' | 'text' | 'quiz' | 'assignment';
  duration?: number; // in minutes
  content?: string;
  videoUrl?: string;
  completed?: boolean;
  quizId?: number;
}
