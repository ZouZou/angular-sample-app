import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Course } from '../entities/Course';
import { CourseSection } from '../entities/CourseSection';
import { Lesson } from '../entities/Lesson';
import { Quiz } from '../entities/Quiz';
import { QuizQuestion } from '../entities/QuizQuestion';
import { QuizOption } from '../entities/QuizOption';
import { Enrollment } from '../entities/Enrollment';
import { UserProgress } from '../entities/UserProgress';
import { QuizAttempt } from '../entities/QuizAttempt';
import { UserAnswer } from '../entities/UserAnswer';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'lms_db',
  synchronize: process.env.NODE_ENV === 'development', // Auto-create tables in development
  logging: process.env.NODE_ENV === 'development',
  entities: [
    User,
    Course,
    CourseSection,
    Lesson,
    Quiz,
    QuizQuestion,
    QuizOption,
    Enrollment,
    UserProgress,
    QuizAttempt,
    UserAnswer
  ],
  subscribers: [],
  migrations: [],
});

export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established successfully');
  } catch (error) {
    console.error('Error connecting to database:', error);
    process.exit(1);
  }
};
