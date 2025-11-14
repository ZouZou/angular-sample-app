# Dashboard & Analytics Skill

Create comprehensive analytics dashboards for admins, instructors, and students with charts, metrics, reporting, and data visualization.

## Overview

Build three types of dashboards:
- **Admin Dashboard**: System-wide metrics, user analytics, revenue tracking
- **Instructor Dashboard**: Course performance, student progress, engagement metrics
- **Student Dashboard**: Learning progress, achievements, recommendations

## Implementation

### Backend - Analytics Service

```typescript
// backend/src/services/analyticsService.ts
export class AnalyticsService {
  // Admin Analytics
  async getSystemMetrics() {
    const [totalUsers, totalCourses, totalEnrollments, totalRevenue] = await Promise.all([
      userRepository.count(),
      courseRepository.count({ where: { published: true } }),
      enrollmentRepository.count(),
      this.getTotalRevenue()
    ]);

    const newUsersThisMonth = await userRepository.count({
      where: { createdAt: MoreThan(startOfMonth(new Date())) }
    });

    const activeUsers = await this.getActiveUsers(30);

    return {
      totalUsers,
      newUsersThisMonth,
      activeUsers,
      totalCourses,
      totalEnrollments,
      totalRevenue,
      growthRate: this.calculateGrowth(newUsersThisMonth, totalUsers)
    };
  }

  async getUserGrowth(days: number = 30) {
    const data = await userRepository
      .createQueryBuilder('user')
      .select('DATE(user.createdAt)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('user.createdAt >= :start', {
        start: subDays(new Date(), days)
      })
      .groupBy('DATE(user.createdAt)')
      .orderBy('date', 'ASC')
      .getRawMany();

    return data.map(d => ({
      date: d.date,
      users: parseInt(d.count)
    }));
  }

  async getRevenueByMonth(months: number = 12) {
    return await paymentRepository
      .createQueryBuilder('payment')
      .select('DATE_TRUNC(\'month\', payment.createdAt)', 'month')
      .addSelect('SUM(payment.amount)', 'revenue')
      .where('payment.status = :status', { status: 'completed' })
      .andWhere('payment.createdAt >= :start', {
        start: subMonths(new Date(), months)
      })
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany();
  }

  // Instructor Analytics
  async getCourseAnalytics(courseId: number) {
    const [
      totalEnrollments,
      activeStudents,
      completionRate,
      averageProgress,
      averageQuizScore
    ] = await Promise.all([
      enrollmentRepository.count({ where: { courseId } }),
      this.getActiveCourseStudents(courseId, 7),
      this.getCourseCompletionRate(courseId),
      this.getAverageProgress(courseId),
      this.getAverageQuizScore(courseId)
    ]);

    return {
      totalEnrollments,
      activeStudents,
      completionRate,
      averageProgress,
      averageQuizScore,
      revenue: await this.getCourseRevenue(courseId)
    };
  }

  async getStudentProgress(courseId: number) {
    return await enrollmentRepository.find({
      where: { courseId },
      relations: ['user'],
      select: ['id', 'userId', 'progress', 'lastAccessedAt'],
      order: { progress: 'DESC' }
    });
  }

  async getLessonCompletion(courseId: number) {
    return await progressRepository
      .createQueryBuilder('progress')
      .innerJoin('progress.lesson', 'lesson')
      .innerJoin('lesson.section', 'section')
      .where('section.courseId = :courseId', { courseId })
      .select('lesson.id', 'lessonId')
      .addSelect('lesson.title', 'lessonTitle')
      .addSelect('COUNT(CASE WHEN progress.completed = true THEN 1 END)', 'completed')
      .addSelect('COUNT(*)', 'total')
      .groupBy('lesson.id, lesson.title')
      .getRawMany();
  }

  // Student Analytics
  async getStudentDashboard(userId: number) {
    const [enrollments, totalCourses, completedCourses, totalTimeSpent] = await Promise.all([
      enrollmentRepository.find({
        where: { userId },
        relations: ['course'],
        order: { lastAccessedAt: 'DESC' }
      }),
      enrollmentRepository.count({ where: { userId } }),
      enrollmentRepository.count({
        where: { userId, status: 'completed' }
      }),
      this.getTotalTimeSpent(userId)
    ]);

    const inProgress = enrollments.filter(e => e.status === 'active');
    const recentActivity = await this.getRecentActivity(userId, 10);
    const achievements = await this.getUserAchievements(userId);

    return {
      enrollments: {
        total: totalCourses,
        inProgress: inProgress.length,
        completed: completedCourses
      },
      timeSpent: totalTimeSpent,
      recentActivity,
      achievements,
      recommendations: await this.getRecommendedCourses(userId)
    };
  }

  async getLearningStreak(userId: number) {
    const activities = await progressRepository.find({
      where: { userId, completed: true },
      order: { completedAt: 'DESC' },
      take: 365
    });

    let currentStreak = 0;
    let longestStreak = 0;
    let streak = 0;
    let lastDate: Date | null = null;

    activities.forEach(activity => {
      const date = startOfDay(activity.completedAt);

      if (!lastDate) {
        streak = 1;
      } else {
        const diff = differenceInDays(lastDate, date);
        if (diff === 1) {
          streak++;
        } else if (diff > 1) {
          longestStreak = Math.max(longestStreak, streak);
          streak = 1;
        }
      }

      lastDate = date;
    });

    currentStreak = differenceInDays(new Date(), lastDate!) === 0 ? streak : 0;
    longestStreak = Math.max(longestStreak, streak);

    return { currentStreak, longestStreak };
  }
}
```

### Frontend - Dashboard Components

```typescript
// src/app/dashboard/admin-dashboard/admin-dashboard.component.ts
import { Chart } from 'chart.js/auto';

export class AdminDashboardComponent implements OnInit {
  metrics$: Observable<any>;
  userGrowthChart: Chart;
  revenueChart: Chart;

  ngOnInit() {
    this.loadMetrics();
    this.loadCharts();
  }

  loadMetrics() {
    this.metrics$ = this.analyticsService.getSystemMetrics();
  }

  loadCharts() {
    // User growth chart
    this.analyticsService.getUserGrowth(30).subscribe(data => {
      this.userGrowthChart = new Chart('userGrowthCanvas', {
        type: 'line',
        data: {
          labels: data.map(d => d.date),
          datasets: [{
            label: 'New Users',
            data: data.map(d => d.users),
            borderColor: '#4CAF50',
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'User Growth (Last 30 Days)' }
          }
        }
      });
    });

    // Revenue chart
    this.analyticsService.getRevenueByMonth(12).subscribe(data => {
      this.revenueChart = new Chart('revenueCanvas', {
        type: 'bar',
        data: {
          labels: data.map(d => d.month),
          datasets: [{
            label: 'Revenue ($)',
            data: data.map(d => d.revenue),
            backgroundColor: '#2196F3'
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Monthly Revenue' }
          }
        }
      });
    });
  }
}
```

### Dashboard Template

```html
<!-- admin-dashboard.component.html -->
<div class="dashboard-container">
  <!-- Metric Cards -->
  <div class="metrics-grid" *ngIf="metrics$ | async as metrics">
    <mat-card class="metric-card">
      <mat-card-content>
        <h3>Total Users</h3>
        <div class="metric-value">{{ metrics.totalUsers | number }}</div>
        <div class="metric-change positive">
          +{{ metrics.newUsersThisMonth }} this month
        </div>
      </mat-card-content>
    </mat-card>

    <mat-card class="metric-card">
      <mat-card-content>
        <h3>Active Users</h3>
        <div class="metric-value">{{ metrics.activeUsers | number }}</div>
        <div class="metric-subtitle">Last 30 days</div>
      </mat-card-content>
    </mat-card>

    <mat-card class="metric-card">
      <mat-card-content>
        <h3>Total Courses</h3>
        <div class="metric-value">{{ metrics.totalCourses | number }}</div>
      </mat-card-content>
    </mat-card>

    <mat-card class="metric-card">
      <mat-card-content>
        <h3>Total Revenue</h3>
        <div class="metric-value">{{ metrics.totalRevenue | currency }}</div>
        <div class="metric-change positive">+12% vs last month</div>
      </mat-card-content>
    </mat-card>
  </div>

  <!-- Charts -->
  <div class="charts-grid">
    <mat-card>
      <mat-card-content>
        <canvas id="userGrowthCanvas"></canvas>
      </mat-card-content>
    </mat-card>

    <mat-card>
      <mat-card-content>
        <canvas id="revenueCanvas"></canvas>
      </mat-card-content>
    </mat-card>
  </div>

  <!-- Recent Activity Table -->
  <mat-card>
    <mat-card-header>
      <mat-card-title>Recent Enrollments</mat-card-title>
    </mat-card-header>
    <mat-card-content>
      <table mat-table [dataSource]="recentEnrollments$">
        <!-- Columns -->
      </table>
    </mat-card-content>
  </mat-card>
</div>
```

## Chart Libraries

```typescript
// Install dependencies
npm install chart.js ng2-charts
npm install d3 @types/d3

// Alternative: ngx-charts
npm install @swimlane/ngx-charts
```

## API Endpoints

```
GET /api/analytics/system/metrics      - Admin system metrics
GET /api/analytics/users/growth        - User growth data
GET /api/analytics/revenue/monthly     - Monthly revenue
GET /api/analytics/courses/:id/stats   - Course analytics
GET /api/analytics/students/progress   - Student progress
GET /api/analytics/dashboard/student   - Student dashboard
GET /api/analytics/reports/export      - Export reports (CSV/PDF)
```

## Features

✅ Admin dashboard with system metrics
✅ Instructor dashboard with course analytics
✅ Student dashboard with learning progress
✅ Interactive charts (Chart.js, D3.js)
✅ Real-time statistics
✅ Export reports (PDF, CSV, Excel)
✅ Custom date ranges
✅ KPI tracking
✅ Engagement metrics
✅ Revenue analytics
✅ Learning streaks and achievements
✅ Course recommendations

This skill provides comprehensive analytics for data-driven decision making across all user types.
