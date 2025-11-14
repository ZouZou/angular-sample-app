import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { QuizService } from '../../../services/quiz.service';
import { Quiz, QuizAttempt } from '../../../models/quiz.interface';
import { NotificationService } from '../../../../shared/services/notification.service';
import { LoggerService } from '../../../../shared/services/logger.service';

@Component({
  selector: 'app-quiz-result',
  templateUrl: './quiz-result.component.html',
  styleUrls: ['./quiz-result.component.css'],
  standalone: false
})
export class QuizResultComponent implements OnInit, OnDestroy {
  quiz: Quiz | null = null;
  attempt: QuizAttempt | null = null;
  isLoading = true;
  error: string | null = null;

  private destroy$ = new Subject<void>();
  private courseId!: number;
  private quizId!: number;
  private attemptId!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: QuizService,
    private notificationService: NotificationService,
    private logger: LoggerService
  ) {}

  ngOnInit(): void {
    const courseIdParam = this.route.parent?.snapshot.paramMap.get('id');
    const quizIdParam = this.route.snapshot.paramMap.get('quizId');
    const attemptIdParam = this.route.snapshot.paramMap.get('attemptId');

    if (courseIdParam && quizIdParam && attemptIdParam) {
      this.courseId = parseInt(courseIdParam, 10);
      this.quizId = parseInt(quizIdParam, 10);
      this.attemptId = parseInt(attemptIdParam, 10);
      this.loadResults();
    } else {
      this.error = 'Invalid parameters';
      this.isLoading = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadResults(): void {
    this.isLoading = true;
    this.error = null;

    this.quizService.getQuiz(this.quizId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (quiz) => {
          this.quiz = quiz;
          this.loadAttempt();
        },
        error: (error) => {
          this.logger.error('Error loading quiz:', error);
          this.error = 'Failed to load quiz';
          this.isLoading = false;
        }
      });
  }

  loadAttempt(): void {
    this.quizService.getAttempt(this.attemptId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (attempt) => {
          if (attempt) {
            this.attempt = attempt;
            this.isLoading = false;
            this.showScoreNotification(attempt);
          } else {
            this.error = 'Attempt not found';
            this.isLoading = false;
          }
        },
        error: (error) => {
          this.logger.error('Error loading attempt:', error);
          this.error = 'Failed to load results';
          this.isLoading = false;
        }
      });
  }

  showScoreNotification(attempt: QuizAttempt): void {
    const score = attempt.percentage;
    const passed = attempt.passed;

    if (passed) {
      if (score >= 90) {
        this.notificationService.success(`🎉 Outstanding! You scored ${score}% - Excellent work!`);
      } else if (score >= 80) {
        this.notificationService.success(`🌟 Great job! You scored ${score}% and passed the quiz!`);
      } else {
        this.notificationService.success(`✅ Well done! You scored ${score}% and passed the quiz!`);
      }
    } else {
      this.notificationService.warning(`You scored ${score}%. Keep practicing and try again!`);
    }
  }

  getScoreColor(): string {
    if (!this.attempt) return 'primary';
    if (this.attempt.passed) return 'primary';
    return 'warn';
  }

  getScoreIcon(): string {
    if (!this.attempt) return 'grade';
    return this.attempt.passed ? 'check_circle' : 'cancel';
  }

  getCorrectAnswersCount(): number {
    if (!this.attempt) return 0;
    return this.attempt.answers.filter(a => a.isCorrect).length;
  }

  getIncorrectAnswersCount(): number {
    if (!this.attempt) return 0;
    return this.attempt.answers.filter(a => !a.isCorrect).length;
  }

  retakeQuiz(): void {
    this.router.navigate(['/courses', this.courseId, 'learn', 'quiz', this.quizId]);
  }

  reviewAnswers(): void {
    this.router.navigate(['/courses', this.courseId, 'learn', 'quiz', this.quizId, 'review', this.attemptId]);
  }

  continueCourse(): void {
    this.router.navigate(['/courses', this.courseId, 'learn']);
  }
}
