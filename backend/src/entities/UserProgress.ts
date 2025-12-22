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

  @Column({ name: 'watch_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 })
  watchPercentage!: number;

  @Column({ name: 'current_position', type: 'int', default: 0 })
  currentPosition!: number;

  @Column({ name: 'last_watched_at', nullable: true })
  lastWatchedAt?: Date;

  @Column({ name: 'playback_speed', type: 'decimal', precision: 3, scale: 2, default: 1.00 })
  playbackSpeed!: number;

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
