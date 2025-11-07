export interface User {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string;
  role: 'student' | 'instructor' | 'admin';
}
