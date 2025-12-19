import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { InstructorAnalyticsService } from '../../course/services/instructor-analytics.service';
import { ExportService } from '../../shared/services/export.service';
import { CourseService } from '../../course/services/course.service';
import { Course } from '../../course/models/course.interface';
import { CourseAnalytics, StudentEnrollmentData, QuizPerformanceData } from '../../course/models/analytics.interface';
import { AnalyticsCardComponent } from '../shared/analytics-card/analytics-card.component';
import { PerformanceBadgeComponent } from '../shared/performance-badge/performance-badge.component';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificationService } from '../../shared/services/notification.service';
import { LoggerService } from '../../shared/services/logger.service';
import { fadeInUp, scaleIn } from '../../shared/animations/animations';

@Component({
  selector: 'app-course-analytics',
  templateUrl: './course-analytics.component.html',
  styleUrls: ['./course-analytics.component.scss'],
  standalone: true,
  animations: [fadeInUp, scaleIn],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatMenuModule,
    MatProgressBarModule,
    AnalyticsCardComponent,
    PerformanceBadgeComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CourseAnalyticsComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  router = inject(Router);
  private analyticsService = inject(InstructorAnalyticsService);
  private courseService = inject(CourseService);
  private exportService = inject(ExportService);
  private notificationService = inject(NotificationService);
  private logger = inject(LoggerService);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private destroy$ = new Subject<void>();

  courseId!: number;
  course: Course | null = null;
  analytics: CourseAnalytics | null = null;
  students: StudentEnrollmentData[] = [];
  quizPerformance: QuizPerformanceData[] = [];

  displayedColumns: string[] = ['name', 'email', 'status', 'progress', 'quizScore', 'lastActive', 'actions'];
  dataSource = new MatTableDataSource<StudentEnrollmentData>();

  searchControl = new FormControl('');
  statusFilter = new FormControl('all');

  isLoading = false;
  error: string | null = null;

  ngOnInit(): void {
    const courseIdParam = this.route.snapshot.paramMap.get('courseId');
    if (!courseIdParam) {
      this.router.navigate(['/instructor']);
      return;
    }

    this.courseId = parseInt(courseIdParam);
    this.loadData();
    this.setupFilters();
  }

  loadData(): void {
    this.isLoading = true;
    this.error = null;
    this.cdr.markForCheck();

    forkJoin({
      course: this.courseService.getCourse(this.courseId),
      analytics: this.analyticsService.getCourseOverview(this.courseId),
      students: this.analyticsService.getCourseStudents(this.courseId),
      quizPerformance: this.analyticsService.getQuizPerformance(this.courseId)
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.course = data.course;
          this.analytics = data.analytics;
          this.students = data.students;
          this.quizPerformance = data.quizPerformance;
          this.dataSource.data = this.students;
          this.isLoading = false;
          this.cdr.markForCheck();

          // Set up table sorting and pagination after data is loaded
          setTimeout(() => {
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;
          });
        },
        error: (error) => {
          this.logger.error('Error loading course analytics:', error);
          this.error = 'Failed to load course analytics';
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
  }

  setupFilters(): void {
    // Search filter
    this.searchControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        this.dataSource.filter = value?.trim().toLowerCase() || '';
      });

    // Status filter
    this.statusFilter.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.dataSource.filterPredicate = (data: StudentEnrollmentData, filter: string) => {
          const matchesSearch = !filter ||
            data.userName.toLowerCase().includes(filter) ||
            data.userEmail.toLowerCase().includes(filter);

          const matchesStatus = status === 'all' || data.status === status;

          return matchesSearch && matchesStatus;
        };
        this.dataSource.filter = this.searchControl.value?.trim().toLowerCase() || '';
      });

    // Custom filter predicate
    this.dataSource.filterPredicate = (data: StudentEnrollmentData, filter: string) => {
      return data.userName.toLowerCase().includes(filter) ||
             data.userEmail.toLowerCase().includes(filter);
    };
  }

  viewStudentDetail(studentId: number): void {
    this.router.navigate(['/instructor/student', studentId], {
      queryParams: { courseId: this.courseId }
    });
  }

  exportStudents(format: 'csv' | 'xlsx'): void {
    const exportData = this.students.map(s => ({
      'Student Name': s.userName,
      'Email': s.userEmail,
      'Status': s.status,
      'Progress (%)': s.progress,
      'Completed Lessons': s.completedLessons,
      'Total Lessons': s.totalLessons,
      'Average Quiz Score (%)': s.averageQuizScore || 'N/A',
      'Quizzes Taken': s.quizzesTaken,
      'Total Quizzes': s.totalQuizzes,
      'Time Spent (minutes)': s.timeSpent,
      'Enrolled Date': new Date(s.enrolledDate).toLocaleDateString(),
      'Last Accessed': s.lastAccessedDate ? new Date(s.lastAccessedDate).toLocaleDateString() : 'Never'
    }));

    const filename = `${this.course?.title.replace(/[^a-z0-9]/gi, '_')}_students`;

    if (format === 'csv') {
      this.exportService.exportToCSV(exportData, filename);
    } else {
      this.exportService.exportToExcel(exportData, filename, 'Students');
    }

    this.notificationService.success(`Student data exported as ${format.toUpperCase()}`);
  }

  getScoreColor(score: number | null): string {
    if (score === null) return '#999';
    if (score >= 80) return '#4caf50';
    if (score >= 60) return '#ff9800';
    return '#f44336';
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return 'primary';
      case 'completed': return 'accent';
      case 'dropped': return 'warn';
      default: return '';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
