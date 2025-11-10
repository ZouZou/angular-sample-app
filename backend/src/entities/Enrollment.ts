import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn, Unique } from 'typeorm';
import { User } from './User';
import { Course } from './Course';
import { UserProgress } from './UserProgress';
import { QuizAttempt } from './QuizAttempt';

@Entity('enrollments')
@Unique(['userId', 'courseId'])
export class Enrollment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_id' })
  userId!: number;

  @Column({ name: 'course_id' })
  courseId!: number;

  @Column({ default: 'active' })
  status!: 'active' | 'completed' | 'dropped';

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  progress!: number;

  @CreateDateColumn({ name: 'enrolled_at' })
  enrolledAt!: Date;

  @Column({ name: 'last_accessed_at', nullable: true })
  lastAccessedAt?: Date;

  @Column({ name: 'completed_at', nullable: true })
  completedAt?: Date;

  @Column({ name: 'certificate_url', nullable: true })
  certificateUrl?: string;

  @ManyToOne(() => User, user => user.enrollments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Course, course => course.enrollments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course!: Course;

  @OneToMany(() => UserProgress, progress => progress.enrollment)
  userProgress!: UserProgress[];

  @OneToMany(() => QuizAttempt, attempt => attempt.enrollment)
  quizAttempts!: QuizAttempt[];
}
