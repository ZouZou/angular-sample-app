import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { QuizService } from '../../../services/quiz.service';
import { EnrollmentService } from '../../../services/enrollment.service';
import { AuthService } from '../../../services/auth.service';
import { Quiz, QuizQuestion, QuizAttempt, UserAnswer } from '../../../models/quiz.interface';

@Component({
  selector: 'app-quiz-player',
  templateUrl: './quiz-player.component.html',
  styleUrls: ['./quiz-player.component.css'],
  standalone: false
})
export class QuizPlayerComponent implements OnInit, OnDestroy {
  quiz: Quiz | null = null;
  currentAttempt: QuizAttempt | null = null;
  userAnswers: Map<number, number[]> = new Map();
  currentQuestionIndex = 0;
  isLoading = true;
  isSubmitting = false;
  error: string | null = null;
  timeRemaining: number | null = null;
  timerInterval: any;

  private destroy$ = new Subject<void>();
  private courseId!: number;
  private quizId!: number;
  private userId!: number;
  private enrollmentId!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: QuizService,
    private enrollmentService: EnrollmentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const courseIdParam = this.route.parent?.snapshot.paramMap.get('id');
    const quizIdParam = this.route.snapshot.paramMap.get('quizId');
    this.userId = this.authService.currentUserId || 1;

    if (courseIdParam && quizIdParam) {
      this.courseId = parseInt(courseIdParam, 10);
      this.quizId = parseInt(quizIdParam, 10);
      this.loadQuiz();
    } else {
      this.error = 'Invalid quiz ID';
      this.isLoading = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  loadQuiz(): void {
    this.isLoading = true;
    this.error = null;

    // Get enrollment first
    this.enrollmentService.getEnrollment(this.userId, this.courseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (enrollment) => {
          if (enrollment) {
            this.enrollmentId = enrollment.id!;
            this.loadQuizData();
          } else {
            this.error = 'You are not enrolled in this course';
            this.isLoading = false;
          }
        },
        error: (error) => {
          console.error('Error loading enrollment:', error);
          this.error = 'Failed to verify enrollment';
          this.isLoading = false;
        }
      });
  }

  loadQuizData(): void {
    this.quizService.getQuiz(this.quizId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (quiz) => {
          this.quiz = quiz;
          this.startQuizAttempt();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading quiz:', error);
          this.error = 'Failed to load quiz';
          this.isLoading = false;
        }
      });
  }

  startQuizAttempt(): void {
    this.quizService.startQuizAttempt(this.userId, this.enrollmentId, this.quizId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (attempt) => {
          this.currentAttempt = attempt;

          // Start timer if quiz has time limit
          if (this.quiz?.timeLimit) {
            this.timeRemaining = this.quiz.timeLimit * 60; // Convert to seconds
            this.startTimer();
          }
        },
        error: (error) => {
          console.error('Error starting quiz attempt:', error);
          this.error = 'Failed to start quiz';
        }
      });
  }

  startTimer(): void {
    this.timerInterval = setInterval(() => {
      if (this.timeRemaining !== null && this.timeRemaining > 0) {
        this.timeRemaining--;
      } else if (this.timeRemaining === 0) {
        // Time's up - auto submit
        this.submitQuiz();
      }
    }, 1000);
  }

  getCurrentQuestion(): QuizQuestion | null {
    if (!this.quiz || !this.quiz.questions) return null;
    return this.quiz.questions[this.currentQuestionIndex] || null;
  }

  selectAnswer(questionId: number, optionId: number, isMultiSelect: boolean): void {
    if (isMultiSelect) {
      const current = this.userAnswers.get(questionId) || [];
      const index = current.indexOf(optionId);

      if (index > -1) {
        // Remove if already selected
        current.splice(index, 1);
      } else {
        // Add if not selected
        current.push(optionId);
      }

      this.userAnswers.set(questionId, current);
    } else {
      // Single select
      this.userAnswers.set(questionId, [optionId]);
    }
  }

  isOptionSelected(questionId: number, optionId: number): boolean {
    const answers = this.userAnswers.get(questionId) || [];
    return answers.includes(optionId);
  }

  isQuestionAnswered(questionId: number): boolean {
    const answers = this.userAnswers.get(questionId) || [];
    return answers.length > 0;
  }

  nextQuestion(): void {
    if (this.quiz && this.currentQuestionIndex < this.quiz.questions.length - 1) {
      this.currentQuestionIndex++;
    }
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  goToQuestion(index: number): void {
    this.currentQuestionIndex = index;
  }

  getAnsweredQuestionsCount(): number {
    return this.userAnswers.size;
  }

  getTotalQuestions(): number {
    return this.quiz?.questions.length || 0;
  }

  canSubmit(): boolean {
    // Can submit if all questions are answered
    return this.getAnsweredQuestionsCount() === this.getTotalQuestions();
  }

  submitQuiz(): void {
    if (!this.currentAttempt || !this.quiz) return;

    if (!this.canSubmit() && this.timeRemaining !== null && this.timeRemaining > 0) {
      if (!confirm('You have not answered all questions. Are you sure you want to submit?')) {
        return;
      }
    }

    this.isSubmitting = true;

    // Stop timer
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    // Convert user answers to UserAnswer format
    const answers: UserAnswer[] = [];
    this.userAnswers.forEach((selectedOptionIds, questionId) => {
      answers.push({
        questionId,
        selectedOptionIds,
        attemptId: this.currentAttempt!.id!,
        isCorrect: false, // Will be determined by server
        pointsEarned: 0 // Will be determined by server
      });
    });

    this.quizService.submitQuizAttempt(this.currentAttempt.id!, answers)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (gradedAttempt) => {
          // Navigate to results page
          this.router.navigate(['/courses', this.courseId, 'learn', 'quiz', this.quizId, 'result', gradedAttempt.id]);
        },
        error: (error) => {
          console.error('Error submitting quiz:', error);
          alert('Failed to submit quiz. Please try again.');
          this.isSubmitting = false;
        }
      });
  }

  getTimerDisplay(): string {
    if (this.timeRemaining === null) return '';

    const minutes = Math.floor(this.timeRemaining / 60);
    const seconds = this.timeRemaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  getTimerColor(): string {
    if (this.timeRemaining === null) return 'primary';
    if (this.timeRemaining < 60) return 'warn';
    if (this.timeRemaining < 300) return 'accent';
    return 'primary';
  }
}
