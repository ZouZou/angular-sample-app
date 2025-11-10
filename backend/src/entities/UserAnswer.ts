import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { QuizAttempt } from './QuizAttempt';
import { QuizQuestion } from './QuizQuestion';

@Entity('user_answers')
export class UserAnswer {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'attempt_id' })
  attemptId!: number;

  @Column({ name: 'question_id' })
  questionId!: number;

  @Column({ name: 'selected_option_ids', type: 'int', array: true })
  selectedOptionIds!: number[];

  @Column({ name: 'is_correct' })
  isCorrect!: boolean;

  @Column({ name: 'points_earned' })
  pointsEarned!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => QuizAttempt, attempt => attempt.answers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'attempt_id' })
  attempt!: QuizAttempt;

  @ManyToOne(() => QuizQuestion, question => question.userAnswers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question!: QuizQuestion;
}
