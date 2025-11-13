import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../course/services/auth.service';
import { EnrollmentService } from '../course/services/enrollment.service';
import { CourseService } from '../course/services/course.service';
import { QuizService } from '../course/services/quiz.service';
import { User } from '../course/models/user.interface';
import { Enrollment } from '../course/models/enrollment.interface';
import { Course } from '../course/models/course.interface';
import { QuizAttempt } from '../course/models/quiz.interface';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificationService } from '../shared/services/notification.service';
import { fadeInUp, staggerList, scaleIn } from '../shared/animations/animations';

interface EnrolledCourseData {
  enrollment: Enrollment;
  course: Course;
  quizAttempts: QuizAttempt[];
  bestScore?: number;
  averageScore?: number;
  completedQuizzes: number;
  totalQuizzes: number;
}

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss'],
  standalone: false,
  animations: [fadeInUp, staggerList, scaleIn]
})
/**
 * Displays the user learning dashboard with course progress and performance metrics
 *
 * Provides a comprehensive overview of enrolled courses, learning progress tracking,
 * and quiz performance statistics. Aggregates quiz attempt data to calculate best scores
 * and average performance per course. Supports quick course navigation and continued learning
 * from enrolled courses. Automatically redirects unauthenticated users to the login page.
 *
 * @example
 * ```html
 * <app-user-dashboard></app-user-dashboard>
 * ```
 */
export class UserDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  currentUser: User | null = null;
  enrolledCourses: EnrolledCourseData[] = [];
  isLoading = false;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private enrollmentService: EnrollmentService,
    private courseService: CourseService,
    private quizService: QuizService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;

    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.error = null;

    const userId = this.currentUser?.id;
    if (!userId) {
      this.error = 'User not found';
      this.isLoading = false;
      return;
    }

    // Get user enrollments
    this.enrollmentService.getUserEnrollments(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (enrollments) => {
          if (enrollments.length === 0) {
            this.isLoading = false;
            return;
          }

          // Fetch course details and quiz attempts for each enrollment
          const courseRequests = enrollments.map(enrollment =>
            this.courseService.getCourse(enrollment.courseId)
          );

          forkJoin(courseRequests)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (courses) => {
                // Get quiz attempts for the user
                this.quizService.getUserAllAttempts(userId)
                  .pipe(takeUntil(this.destroy$))
                  .subscribe({
                    next: (allAttempts) => {
                      this.enrolledCourses = enrollments.map((enrollment, index) => {
                        const course = courses[index];
                        const courseAttempts = allAttempts.filter(
                          attempt => attempt.quizId && this.isQuizInCourse(attempt.quizId, course.id!)
                        );

                        const completedAttempts = courseAttempts.filter(a => a.completedAt);
                        const scores = completedAttempts.map(a => a.percentage);

                        return {
                          enrollment,
                          course,
                          quizAttempts: courseAttempts,
                          bestScore: scores.length > 0 ? Math.max(...scores) : undefined,
                          averageScore: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : undefined,
                          completedQuizzes: completedAttempts.length,
                          totalQuizzes: this.getTotalQuizzesInCourse(course.id!)
                        };
                      });

                      this.isLoading = false;
                    },
                    error: (error) => {
                      console.error('Error loading quiz attempts:', error);
                      // Still show courses even if quiz attempts fail to load
                      this.enrolledCourses = enrollments.map((enrollment, index) => ({
                        enrollment,
                        course: courses[index],
                        quizAttempts: [],
                        completedQuizzes: 0,
                        totalQuizzes: 0
                      }));
                      this.isLoading = false;
                    }
                  });
              },
              error: (error) => {
                console.error('Error loading courses:', error);
                this.error = 'Failed to load course details';
                this.isLoading = false;
              }
            });
        },
        error: (error) => {
          console.error('Error loading enrollments:', error);
          this.error = 'Failed to load your enrolled courses';
          this.isLoading = false;
        }
      });
  }

  // Helper method to check if a quiz belongs to a course
  // This is a simplified version - in production, you'd query the backend
  isQuizInCourse(quizId: number, courseId: number): boolean {
    // For now, we'll assume the relationship exists
    // In production, you'd need to fetch quiz details or have this info in the attempt
    return true;
  }

  // Helper method to get total quizzes in a course
  // This is a placeholder - in production, you'd query the backend
  getTotalQuizzesInCourse(courseId: number): number {
    // For now, return a placeholder
    return 0;
  }

  continueLearning(courseId: number): void {
    this.router.navigate(['/courses', courseId, 'learn']);
  }

  viewCourse(courseId: number): void {
    this.router.navigate(['/courses', courseId]);
  }

  getProgressColor(progress: number): string {
    if (progress >= 75) return 'primary';
    if (progress >= 50) return 'accent';
    return 'warn';
  }

  /**
   * Returns CSS class name for score color based on performance
   * @param score - The score percentage (0-100)
   * @returns CSS class name for styling
   */
  getScoreColorClass(score: number): string {
    if (score >= 80) return 'score-high';
    if (score >= 60) return 'score-medium';
    return 'score-low';
  }

  logout(): void {
    const userName = this.currentUser?.name || 'User';
    this.authService.logout();
    this.notificationService.info(`Goodbye, ${userName}! See you next time. 👋`);
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
