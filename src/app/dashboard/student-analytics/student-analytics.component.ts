import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AnalyticsService, StudentAnalytics } from '../../shared/services/analytics.service';
import { fadeInUp, staggerList, scaleIn } from '../../shared/animations/animations';

@Component({
  selector: 'app-student-analytics',
  templateUrl: './student-analytics.component.html',
  styleUrls: ['./student-analytics.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    NgxChartsModule
  ],
  animations: [fadeInUp, staggerList, scaleIn],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StudentAnalyticsComponent implements OnInit, OnDestroy {
  private analyticsService = inject(AnalyticsService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  analytics: StudentAnalytics | null = null;
  progressChartData: any[] = [];
  quizPerformanceData: any[] = [];
  isLoading = true;
  error: string | null = null;

  // Chart options
  colorScheme: any = {
    domain: ['#3f51b5', '#ff9800', '#4caf50', '#f44336', '#9c27b0']
  };

  chartView: [number, number] = [700, 300];
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = false;
  showXAxisLabel = true;
  showYAxisLabel = true;
  animations = true;

  ngOnInit(): void {
    this.loadStudentAnalytics();
  }

  loadStudentAnalytics(): void {
    this.isLoading = true;
    this.error = null;
    this.cdr.markForCheck();

    this.analyticsService.getStudentAnalytics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (analytics) => {
          this.analytics = analytics;

          // Transform data for charts
          if (analytics.progressOverTime.length > 0) {
            this.progressChartData = [{
              name: 'Learning Progress',
              series: analytics.progressOverTime.map(d => ({
                name: new Date(d.date).toLocaleDateString(),
                value: d.count
              }))
            }];
          }

          if (analytics.quizPerformanceOverTime.length > 0) {
            this.quizPerformanceData = [{
              name: 'Quiz Performance',
              series: analytics.quizPerformanceOverTime.map(d => ({
                name: new Date(d.date).toLocaleDateString(),
                value: d.count
              }))
            }];
          }

          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error loading student analytics:', error);
          this.error = 'Failed to load your analytics data';
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
  }

  getStreakIcon(): string {
    if (!this.analytics) return 'local_fire_department';
    if (this.analytics.learningStreak >= 7) return 'whatshot';
    if (this.analytics.learningStreak >= 3) return 'local_fire_department';
    return 'whatshot';
  }

  getStreakColor(): string {
    if (!this.analytics) return '#ff9800';
    if (this.analytics.learningStreak >= 7) return '#f44336';
    if (this.analytics.learningStreak >= 3) return '#ff9800';
    return '#ffc107';
  }

  getPerformanceLevel(): string {
    if (!this.analytics) return 'Getting Started';
    const score = this.analytics.averageQuizScore;
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Improvement';
  }

  refresh(): void {
    this.loadStudentAnalytics();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
