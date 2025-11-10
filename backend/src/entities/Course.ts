import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { CourseSection } from './CourseSection';
import { Enrollment } from './Enrollment';
import { Quiz } from './Quiz';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ nullable: true })
  instructor?: string;

  @Column({ type: 'int', nullable: true })
  duration?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price?: number;

  @Column({ nullable: true })
  category?: string;

  @Column({ nullable: true })
  level?: 'Beginner' | 'Intermediate' | 'Advanced';

  @Column({ name: 'thumbnail_url', nullable: true })
  thumbnailUrl?: string;

  @Column({ name: 'banner_url', nullable: true })
  bannerUrl?: string;

  @Column({ name: 'enrollment_count', default: 0 })
  enrollmentCount!: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  rating?: number;

  @Column({ nullable: true })
  language?: string;

  @Column({ type: 'text', array: true, nullable: true })
  requirements?: string[];

  @Column({ name: 'learning_outcomes', type: 'text', array: true, nullable: true })
  learningOutcomes?: string[];

  @Column({ default: false })
  published!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => CourseSection, section => section.course)
  sections!: CourseSection[];

  @OneToMany(() => Enrollment, enrollment => enrollment.course)
  enrollments!: Enrollment[];

  @OneToMany(() => Quiz, quiz => quiz.course)
  quizzes!: Quiz[];
}
