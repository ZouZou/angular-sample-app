import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Quiz } from './Quiz';
import { QuizOption } from './QuizOption';
import { UserAnswer } from './UserAnswer';

@Entity('quiz_questions')
export class QuizQuestion {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'quiz_id' })
  quizId!: number;

  @Column({ type: 'text' })
  question!: string;

  @Column()
  type!: 'multiple-choice' | 'true-false' | 'multi-select';

  @Column({ name: 'order_number' })
  order!: number;

  @Column({ default: 1 })
  points!: number;

  @Column({ type: 'text', nullable: true })
  explanation?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => Quiz, quiz => quiz.questions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quiz_id' })
  quiz!: Quiz;

  @OneToMany(() => QuizOption, option => option.question)
  options!: QuizOption[];

  @OneToMany(() => UserAnswer, answer => answer.question)
  userAnswers!: UserAnswer[];
}
