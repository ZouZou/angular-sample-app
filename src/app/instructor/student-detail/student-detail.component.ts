import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatMenuModule } from '@angular/material/menu';
import { InstructorAnalyticsService } from '../../course/services/instructor-analytics.service';
import { ExportService } from '../../shared/services/export.service';
import { StudentDetailData } from '../../course/models/analytics.interface';
import { AnalyticsCardComponent } from '../shared/analytics-card/analytics-card.component';
import { PerformanceBadgeComponent } from '../shared/performance-badge/performance-badge.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificationService } from '../../shared/services/notification.service';
import { LoggerService } from '../../shared/services/logger.service';
import { fadeInUp, scaleIn } from '../../shared/animations/animations';

@Component({
  selector: 'app-student-detail',
  templateUrl: './student-detail.component.html',
  styleUrls: ['./student-detail.component.scss'],
  standalone: true,
  animations: [fadeInUp, scaleIn],
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatProgressBarModule,
    MatMenuModule,
    AnalyticsCardComponent,
    PerformanceBadgeComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StudentDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  router = inject(Router);
  private analyticsService = inject(InstructorAnalyticsService);
  private exportService = inject(ExportService);
  private notificationService = inject(NotificationService);
  private logger = inject(LoggerService);
  private cdr = inject(ChangeDetectorRef);

  private destroy$ = new Subject<void>();

  studentId!: number;
  courseId!: number;
  studentData: StudentDetailData | null = null;

  progressColumns: string[] = ['lesson', 'status', 'timeSpent', 'completedDate'];
  quizColumns: string[] = ['quiz', 'score', 'passed', 'attempts', 'completedDate'];

  isLoading = false;
  error: string | null = null;

  ngOnInit(): void {
    const studentIdParam = this.route.snapshot.paramMap.get('studentId');
    const courseIdParam = this.route.snapshot.queryParamMap.get('courseId');

    if (!studentIdParam || !courseIdParam) {
      this.router.navigate(['/instructor']);
      return;
    }

    this.studentId = parseInt(studentIdParam);
    this.courseId = parseInt(courseIdParam);
    this.loadStudentData();
  }

  loadStudentData(): void {
    this.isLoading = true;
    this.error = null;
    this.cdr.markForCheck();

    this.analyticsService.getStudentDetail(this.studentId, this.courseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.studentData = data;
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.logger.error('Error loading student details:', error);
          this.error = 'Failed to load student details';
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
  }

  exportStudentData(format: 'csv' | 'xlsx'): void {
    if (!this.studentData) return;

    const exportData = {
      progressData: this.studentData.progressRecords.map(p => ({
        'Lesson ID': p.lessonId,
        'Completed': p.completed ? 'Yes' : 'No',
        'Time Spent (minutes)': p.timeSpent || 0,
        'Completed Date': p.completedDate ? new Date(p.completedDate).toLocaleDateString() : 'Not completed',
        'Notes': p.notes || ''
      })),
      quizData: this.studentData.quizAttempts.map(a => ({
        'Quiz ID': a.quizId,
        'Score': a.score,
        'Total Points': a.totalPoints,
        'Percentage': a.percentage,
        'Passed': a.passed ? 'Yes' : 'No',
        'Attempt Number': a.attemptNumber,
        'Started': new Date(a.startedAt).toLocaleString(),
        'Completed': a.completedAt ? new Date(a.completedAt).toLocaleString() : 'Not completed'
      }))
    };

    const filename = `${this.studentData.user.name.replace(/[^a-z0-9]/gi, '_')}_performance`;

    if (format === 'csv') {
      // Export progress
      this.exportService.exportToCSV(exportData.progressData, `${filename}_progress`);
      // Export quiz attempts
      this.exportService.exportToCSV(exportData.quizData, `${filename}_quizzes`);
      this.notificationService.success('Student data exported as CSV');
    } else {
      // Note: For Excel, we'd need to export to separate sheets - simplified here
      this.exportService.exportToExcel(exportData.progressData, `${filename}_progress`, 'Progress');
      this.exportService.exportToExcel(exportData.quizData, `${filename}_quizzes`, 'Quizzes');
      this.notificationService.success('Student data exported as Excel');
    }
  }

  getScoreColor(score: number): string {
    if (score >= 80) return '#4caf50';
    if (score >= 60) return '#ff9800';
    return '#f44336';
  }

  formatTimeSpent(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }

  getCompletedLessonsCount(): number {
    return this.studentData?.progressRecords.filter(p => p.completed).length || 0;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
