import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Lesson } from './Lesson';
import { User } from './User';
import { Enrollment } from './Enrollment';

@Entity('video_analytics')
@Index(['lessonId', 'userId'])
export class VideoAnalytics {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'lesson_id' })
  lessonId!: number;

  @Column({ name: 'user_id' })
  userId!: number;

  @Column({ name: 'enrollment_id' })
  enrollmentId!: number;

  @Column({ name: 'session_id' })
  sessionId!: string;

  @Column({ name: 'watch_duration', type: 'int', default: 0 })
  watchDuration!: number;

  @Column({ name: 'total_duration', type: 'int', default: 0 })
  totalDuration!: number;

  @Column({ name: 'completion_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 })
  completionPercentage!: number;

  @Column({ name: 'playback_speed', type: 'decimal', precision: 3, scale: 2, default: 1.00 })
  playbackSpeed!: number;

  @Column({ name: 'paused_count', type: 'int', default: 0 })
  pausedCount!: number;

  @Column({ name: 'seeked_count', type: 'int', default: 0 })
  seekedCount!: number;

  @Column({ name: 'device_type', nullable: true })
  deviceType?: string;

  @Column({ name: 'browser', nullable: true })
  browser?: string;

  @CreateDateColumn({ name: 'session_start' })
  sessionStart!: Date;

  @Column({ name: 'session_end', nullable: true })
  sessionEnd?: Date;

  @ManyToOne(() => Lesson, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lesson_id' })
  lesson!: Lesson;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Enrollment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'enrollment_id' })
  enrollment!: Enrollment;
}
