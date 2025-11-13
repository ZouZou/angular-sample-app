import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { CourseService } from '../../services/course.service';
import { AuthService } from '../../services/auth.service';
import { Course } from '../../models/course.interface';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { NotificationService } from '../../../shared/services/notification.service';
import { fadeInUp, staggerList } from '../../../shared/animations/animations';

@Component({
  selector: 'app-course-list',
  templateUrl: './course-list.component.html',
  styleUrls: ['./course-list.component.css'],
  standalone: false,
  animations: [fadeInUp, staggerList]
})
/**
 * Displays a filterable course catalog with administrative management actions
 *
 * Renders a comprehensive list of available courses with dynamic filtering by category and difficulty level.
 * Provides course navigation, detailed view access, and administrative capabilities for course creation,
 * editing, and deletion. Supports responsive layout detection for mobile and desktop views. Includes course
 * level classification with visual styling for better user experience.
 *
 * @example
 * ```html
 * <app-course-list></app-course-list>
 * ```
 */
export class CourseListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  courses: Course[] = [];
  filteredCourses: Course[] = [];
  isLoading = false;
  error: string | null = null;

  // Responsive layout
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(map(result => result.matches));

  // Filter options
  selectedCategory = 'All';
  selectedLevel = 'All';
  categories = ['All', 'Web Development', 'Programming', 'Data Science', 'Design', 'Business'];
  levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  constructor(
    private courseService: CourseService,
    private authService: AuthService,
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    private dialog: MatDialog,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.isLoading = true;
    this.error = null;

    this.courseService.getCourses()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (courses) => {
          this.courses = courses;
          this.filteredCourses = courses;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading courses:', error);
          this.error = 'Failed to load courses. Please try again later.';
          this.isLoading = false;
        }
      });
  }

  applyFilters(): void {
    this.filteredCourses = this.courses.filter(course => {
      const categoryMatch = this.selectedCategory === 'All' || course.category === this.selectedCategory;
      const levelMatch = this.selectedLevel === 'All' || course.level === this.selectedLevel;
      return categoryMatch && levelMatch;
    });
  }

  navigateToDetail(eventOrId: Event | number | undefined, courseId?: number | undefined): void {
    // Handle both card click (courseId only) and button click (event + courseId)
    if (eventOrId instanceof Event) {
      eventOrId.stopPropagation();
      if (courseId) {
        this.router.navigate(['/courses', courseId]);
      }
    } else if (typeof eventOrId === 'number') {
      // Called from card click with just courseId
      this.router.navigate(['/courses', eventOrId]);
    }
  }

  navigateToEdit(event: Event, courseId: number | undefined): void {
    event.stopPropagation();
    if (courseId) {
      this.router.navigate(['/courses', courseId, 'edit']);
    }
  }

  navigateToCreate(): void {
    this.router.navigate(['/courses', 'new']);
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  navigateToAdmin(): void {
    this.router.navigate(['/admin']);
  }

  deleteCourse(event: Event, courseId: number | undefined): void {
    event.stopPropagation();
    if (!courseId) return;

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Course',
        message: 'Are you sure you want to delete this course? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        confirmColor: 'warn'
      }
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.courseService.deleteCourse(courseId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.notificationService.success('Course deleted successfully');
                this.loadCourses();
              },
              error: (error) => {
                console.error('Error deleting course:', error);
                this.notificationService.error('Failed to delete course. Please try again.');
              }
            });
        }
      });
  }

  /**
   * Returns CSS class name for course level badge styling
   * @param level - The course difficulty level
   * @returns CSS class name for styling
   */
  getLevelClass(level: string): string {
    switch (level) {
      case 'Beginner':
        return 'level-beginner';
      case 'Intermediate':
        return 'level-intermediate';
      case 'Advanced':
        return 'level-advanced';
      default:
        return 'level-default';
    }
  }

  /**
   * Returns color for course level badge
   * @param level - The course difficulty level
   * @returns Color value for styling
   */
  getLevelColor(level: string): string {
    switch (level) {
      case 'Beginner':
        return '#4caf50';  // Green
      case 'Intermediate':
        return '#ff9800';  // Orange
      case 'Advanced':
        return '#f44336';  // Red
      default:
        return '#9e9e9e';  // Grey
    }
  }

  /**
   * Check if current user is admin
   */
  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  /**
   * Logout the current user
   */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
