import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './User';
import { Enrollment } from './Enrollment';
import { Quiz } from './Quiz';
import { UserAnswer } from './UserAnswer';

@Entity('quiz_attempts')
export class QuizAttempt {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_id' })
  userId!: number;

  @Column({ name: 'enrollment_id' })
  enrollmentId!: number;

  @Column({ name: 'quiz_id' })
  quizId!: number;

  @Column({ name: 'attempt_number' })
  attemptNumber!: number;

  @Column()
  score!: number;

  @Column({ name: 'total_points' })
  totalPoints!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  percentage!: number;

  @Column()
  passed!: boolean;

  @Column({ name: 'started_at' })
  startedAt!: Date;

  @Column({ name: 'completed_at', nullable: true })
  completedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => User, user => user.quizAttempts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Enrollment, enrollment => enrollment.quizAttempts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'enrollment_id' })
  enrollment!: Enrollment;

  @ManyToOne(() => Quiz, quiz => quiz.attempts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quiz_id' })
  quiz!: Quiz;

  @OneToMany(() => UserAnswer, answer => answer.attempt)
  answers!: UserAnswer[];
}
