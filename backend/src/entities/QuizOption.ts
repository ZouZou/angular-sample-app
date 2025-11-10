import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { QuizQuestion } from './QuizQuestion';

@Entity('quiz_options')
export class QuizOption {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'question_id' })
  questionId!: number;

  @Column({ length: 500 })
  text!: string;

  @Column({ name: 'is_correct', default: false })
  isCorrect!: boolean;

  @Column({ name: 'order_number' })
  order!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => QuizQuestion, question => question.options, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question!: QuizQuestion;
}
