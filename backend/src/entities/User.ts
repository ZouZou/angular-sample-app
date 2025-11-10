import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Enrollment } from './Enrollment';
import { UserProgress } from './UserProgress';
import { QuizAttempt } from './QuizAttempt';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @Column()
  name!: string;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl?: string;

  @Column({ default: 'student' })
  role!: 'student' | 'instructor' | 'admin';

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => Enrollment, enrollment => enrollment.user)
  enrollments!: Enrollment[];

  @OneToMany(() => UserProgress, progress => progress.user)
  progress!: UserProgress[];

  @OneToMany(() => QuizAttempt, attempt => attempt.user)
  quizAttempts!: QuizAttempt[];
}
