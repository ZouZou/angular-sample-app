import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from './User';
import { Enrollment } from './Enrollment';
import { Lesson } from './Lesson';

@Entity('user_progress')
@Unique(['userId', 'lessonId'])
export class UserProgress {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_id' })
  userId!: number;

  @Column({ name: 'enrollment_id' })
  enrollmentId!: number;

  @Column({ name: 'lesson_id' })
  lessonId!: number;

  @Column({ default: false })
  completed!: boolean;

  @Column({ name: 'time_spent', default: 0 })
  timeSpent!: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'completed_at', nullable: true })
  completedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => User, user => user.progress, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Enrollment, enrollment => enrollment.userProgress, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'enrollment_id' })
  enrollment!: Enrollment;

  @ManyToOne(() => Lesson, lesson => lesson.userProgress, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lesson_id' })
  lesson!: Lesson;
}
