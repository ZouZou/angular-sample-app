import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { CourseSection } from './CourseSection';
import { UserProgress } from './UserProgress';

@Entity('lessons')
export class Lesson {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'section_id' })
  sectionId!: number;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column()
  type!: 'video' | 'text' | 'quiz' | 'assignment';

  @Column({ name: 'order_number' })
  order!: number;

  @Column({ type: 'int', nullable: true })
  duration?: number;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({ name: 'video_url', nullable: true })
  videoUrl?: string;

  @Column({ name: 'quiz_id', nullable: true })
  quizId?: number;

  @Column({ name: 'video_type', nullable: true })
  videoType?: 'embed' | 'upload';

  @Column({ name: 'video_file_path', nullable: true })
  videoFilePath?: string;

  @Column({ name: 'video_mime_type', nullable: true })
  videoMimeType?: string;

  @Column({ name: 'video_size_bytes', type: 'bigint', nullable: true })
  videoSizeBytes?: number;

  @Column({ name: 'transcript_url', nullable: true })
  transcriptUrl?: string;

  @Column({ name: 'transcript_file_path', nullable: true })
  transcriptFilePath?: string;

  @Column({ name: 'thumbnail_path', nullable: true })
  thumbnailPath?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => CourseSection, section => section.lessons, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'section_id' })
  section!: CourseSection;

  @OneToMany(() => UserProgress, progress => progress.lesson)
  userProgress!: UserProgress[];
}
