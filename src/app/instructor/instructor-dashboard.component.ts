import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../course/services/auth.service';
import { CourseService } from '../course/services/course.service';
import { InstructorAnalyticsService } from '../course/services/instructor-analytics.service';
import { ExportService } from '../shared/services/export.service';
import { User } from '../course/models/user.interface';
import { Course } from '../course/models/course.interface';
import { CourseAnalytics } from '../course/models/analytics.interface';
import { forkJoin, Subject, of } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';
import { NotificationService } from '../shared/services/notification.service';
import { LoggerService } from '../shared/services/logger.service';
import { fadeInUp, staggerList, scaleIn } from '../shared/animations/animations';

interface CourseWithAnalytics {
  course: Course;
  analytics: CourseAnalytics | null;
}

@Component({
  selector: 'app-instructor-dashboard',
  templateUrl: './instructor-dashboard.component.html',
  styleUrls: ['./instructor-dashboard.component.scss'],
  standalone: true,
  animations: [fadeInUp, staggerList, scaleIn],
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatMenuModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InstructorDashboardComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private courseService = inject(CourseService);
  private analyticsService = inject(InstructorAnalyticsService);
  private exportService = inject(ExportService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private logger = inject(LoggerService);
  private cdr = inject(ChangeDetectorRef);

  private destroy$ = new Subject<void>();
  currentUser: User | null = null;
  coursesWithAnalytics: CourseWithAnalytics[] = [];
  isLoading = false;
  error: string | null = null;

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;

    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    // Check if user is instructor or admin
    if (!this.authService.isInstructor() && !this.authService.isAdmin()) {
      this.notificationService.error('Access denied. Instructor privileges required.');
      this.router.navigate(['/courses']);
      return;
    }

    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.error = null;
    this.cdr.markForCheck();

    // Get all courses
    this.courseService.getCourses()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (courses) => {
          if (courses.length === 0) {
            this.isLoading = false;
            this.cdr.markForCheck();
            return;
          }

          // Fetch analytics for each course
          const analyticsRequests = courses.map(course =>
            this.analyticsService.getCourseOverview(course.id!).pipe(
              catchError(error => {
                this.logger.error(`Error loading analytics for course ${course.id}:`, error);
                return of(null);
              })
            )
          );

          forkJoin(analyticsRequests)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (analyticsArray) => {
                this.coursesWithAnalytics = courses.map((course, index) => ({
                  course,
                  analytics: analyticsArray[index]
                }));

                this.isLoading = false;
                this.cdr.markForCheck();
              },
              error: (error) => {
                this.logger.error('Error loading course analytics:', error);
                this.error = 'Failed to load course analytics';
                this.isLoading = false;
                this.cdr.markForCheck();
              }
            });
        },
        error: (error) => {
          this.logger.error('Error loading courses:', error);
          this.error = 'Failed to load courses';
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
  }

  viewCourseAnalytics(courseId: number): void {
    this.router.navigate(['/instructor/course', courseId]);
  }

  manageCourse(courseId: number): void {
    this.router.navigate(['/courses', courseId, 'edit']);
  }

  exportCourseData(courseId: number, courseName: string, format: 'csv' | 'xlsx'): void {
    this.analyticsService.exportCourseData(courseId, format)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          const filename = `${courseName.replace(/[^a-z0-9]/gi, '_')}_analytics`;
          if (format === 'csv') {
            this.exportService.exportToCSV(data, filename);
          } else {
            this.exportService.exportToExcel(data, filename, 'Student Data');
          }
          this.notificationService.success(`Data exported successfully as ${format.toUpperCase()}`);
        },
        error: (error) => {
          this.logger.error('Error exporting data:', error);
          this.notificationService.error('Failed to export data');
        }
      });
  }

  getCompletionRateColor(rate: number): string {
    if (rate >= 75) return 'primary';
    if (rate >= 50) return 'accent';
    return 'warn';
  }

  getScoreColor(score: number): string {
    if (score >= 80) return '#4caf50'; // Green
    if (score >= 60) return '#ff9800'; // Orange
    return '#f44336'; // Red
  }

  getScoreColorClass(score: number): string {
    if (score >= 80) return 'score-high';
    if (score >= 60) return 'score-medium';
    return 'score-low';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
