import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  AnalyticsService,
  SystemOverview,
  TimeSeriesData,
  CourseStats,
  CompletionRate,
  QuizDistribution
} from '../../shared/services/analytics.service';
import { fadeInUp, staggerList } from '../../shared/animations/animations';

@Component({
  selector: 'app-admin-analytics',
  templateUrl: './admin-analytics.component.html',
  styleUrls: ['./admin-analytics.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    NgxChartsModule
  ],
  animations: [fadeInUp, staggerList],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminAnalyticsComponent implements OnInit, OnDestroy {
  private analyticsService = inject(AnalyticsService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  // Data
  systemOverview: SystemOverview | null = null;
  userGrowth: any[] = [];
  enrollmentTrends: any[] = [];
  topCourses: CourseStats[] = [];
  completionRates: any[] = [];
  quizDistribution: any[] = [];

  // Loading states
  isLoading = true;
  error: string | null = null;

  // Chart options
  colorScheme: any = {
    domain: ['#3f51b5', '#ff9800', '#4caf50', '#f44336', '#9c27b0', '#00bcd4']
  };

  // Line chart options
  lineChartView: [number, number] = [700, 300];
  lineChartXAxis = true;
  lineChartYAxis = true;
  lineChartShowLabels = true;
  lineChartAnimations = true;
  lineChartShowXAxisLabel = true;
  lineChartShowYAxisLabel = true;
  lineChartYAxisLabel = 'Count';
  lineChartAutoScale = true;

  // Bar chart options
  barChartView: [number, number] = [700, 400];
  barChartShowXAxis = true;
  barChartShowYAxis = true;
  barChartGradient = false;
  barChartShowLabels = true;
  barChartShowXAxisLabel = true;
  barChartShowYAxisLabel = true;
  barChartXAxisLabel = 'Course';
  barChartYAxisLabel = 'Enrollments';

  // Pie chart options
  pieChartView: [number, number] = [500, 300];
  pieChartGradient = true;
  pieChartShowLabels = true;
  pieChartIsDoughnut = false;
  pieChartShowLegend = true;

  ngOnInit(): void {
    this.loadAllAnalytics();
  }

  loadAllAnalytics(): void {
    this.isLoading = true;
    this.error = null;
    this.cdr.markForCheck();

    // Load system overview
    this.analyticsService.getSystemOverview()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (overview) => {
          this.systemOverview = overview;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error loading system overview:', error);
          this.error = 'Failed to load system overview';
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });

    // Load user growth trends
    this.analyticsService.getUserGrowthTrends(30)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.userGrowth = this.transformToChartData(data, 'User Growth');
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error loading user growth:', error);
        }
      });

    // Load enrollment trends
    this.analyticsService.getEnrollmentTrends(30)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.enrollmentTrends = this.transformToChartData(data, 'Enrollments');
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error loading enrollment trends:', error);
        }
      });

    // Load top courses
    this.analyticsService.getTopCourses(10)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (courses) => {
          this.topCourses = courses;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error loading top courses:', error);
        }
      });

    // Load completion rates
    this.analyticsService.getCourseCompletionRates()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (rates) => {
          this.completionRates = rates.slice(0, 10).map(r => ({
            name: r.courseName,
            value: r.completionRate
          }));
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error loading completion rates:', error);
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });

    // Load quiz distribution
    this.analyticsService.getQuizPerformanceDistribution()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (distribution) => {
          this.quizDistribution = distribution.map(d => ({
            name: d.range + '%',
            value: d.count
          }));
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error loading quiz distribution:', error);
        }
      });
  }

  private transformToChartData(data: TimeSeriesData[], seriesName: string): any[] {
    return [{
      name: seriesName,
      series: data.map(d => ({
        name: new Date(d.date).toLocaleDateString(),
        value: d.count
      }))
    }];
  }

  refresh(): void {
    this.loadAllAnalytics();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
