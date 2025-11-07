export interface Course {
  id?: number;
  title: string;
  description: string;
  instructor: string;
  duration: number; // in hours
  price: number;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  thumbnailUrl?: string;
  bannerUrl?: string;
  enrollmentCount?: number;
  rating?: number;
  createdDate?: Date;
  language?: string;
  requirements?: string[];
  learningOutcomes?: string[];
  published?: boolean;
}
