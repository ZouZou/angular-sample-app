import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CourseService } from '../../services/course.service';
import { CurriculumService } from '../../services/curriculum.service';
import { EnrollmentService } from '../../services/enrollment.service';
import { AuthService } from '../../services/auth.service';
import { Course } from '../../models/course.interface';
import { Enrollment } from '../../models/enrollment.interface';
import { CourseSection } from '../../models/curriculum.interface';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-course-detail',
  templateUrl: './course-detail.component.html',
  styleUrls: ['./course-detail.component.css'],
  standalone: false
})
export class CourseDetailComponent implements OnInit {
  course: Course | null = null;
  enrollment: Enrollment | null = null;
  sections: CourseSection[] = [];
  isLoading = false;
  isEnrolling = false;
  isLoadingCurriculum = false;
  error: string | null = null;

  constructor(
    private courseService: CourseService,
    private curriculumService: CurriculumService,
    private enrollmentService: EnrollmentService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.loadCourse(parseInt(id, 10));
    } else {
      this.error = 'Invalid course ID';
    }
  }

  loadCourse(id: number): void {
    this.isLoading = true;
    this.error = null;

    this.courseService.getCourse(id).subscribe({
      next: (course) => {
        this.course = course;
        this.checkEnrollment(id);
        this.loadCurriculum(id);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading course:', error);
        this.error = 'Failed to load course. The course may not exist.';
        this.isLoading = false;
      }
    });
  }

  loadCurriculum(courseId: number): void {
    this.isLoadingCurriculum = true;

    this.curriculumService.getCourseSections(courseId).subscribe({
      next: (sections) => {
        this.sections = sections.sort((a, b) => a.order - b.order);
        // Sort lessons within each section
        this.sections.forEach(section => {
          section.lessons.sort((a, b) => a.order - b.order);
        });
        this.isLoadingCurriculum = false;
      },
      error: (error) => {
        console.error('Error loading curriculum:', error);
        this.isLoadingCurriculum = false;
      }
    });
  }

  checkEnrollment(courseId: number): void {
    const userId = this.authService.currentUserId;
    if (userId) {
      this.enrollmentService.getEnrollment(userId, courseId).subscribe({
        next: (enrollment) => {
          this.enrollment = enrollment;
        },
        error: (error) => {
          console.error('Error checking enrollment:', error);
        }
      });
    }
  }

  navigateToEdit(): void {
    if (this.course?.id) {
      this.router.navigate(['/courses', this.course.id, 'edit']);
    }
  }

  navigateToList(): void {
    this.router.navigate(['/courses']);
  }

  deleteCourse(): void {
    if (!this.course?.id) return;

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Course',
        message: `Are you sure you want to delete "${this.course.title}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        confirmColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed && this.course?.id) {
        this.courseService.deleteCourse(this.course.id).subscribe({
          next: () => {
            this.notificationService.success('Course deleted successfully');
            this.router.navigate(['/courses']);
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
   * Returns a brand-compliant CSS class name for the course level badge.
   * Maps course level strings to their corresponding level class names.
   *
   * @param level - The course level ('Beginner', 'Intermediate', 'Advanced', or other)
   * @returns The CSS class name for styling the level badge
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

  enrollCourse(): void {
    if (!this.course?.id) return;

    const userId = this.authService.currentUserId;
    if (!userId) {
      this.notificationService.error('Please log in to enroll in courses');
      return;
    }

    this.isEnrolling = true;

    this.enrollmentService.enrollInCourse(userId, this.course.id).subscribe({
      next: (enrollment) => {
        this.enrollment = enrollment;
        this.isEnrolling = false;
        this.notificationService.success(`Successfully enrolled in ${this.course!.title}!`);
        // Navigate to course player
        this.router.navigate(['/courses', this.course!.id, 'learn']);
      },
      error: (error) => {
        console.error('Error enrolling in course:', error);
        this.notificationService.error(error.message || 'Failed to enroll in course. Please try again.');
        this.isEnrolling = false;
      }
    });
  }

  startLearning(): void {
    if (this.course?.id) {
      this.router.navigate(['/courses', this.course.id, 'learn']);
    }
  }

  isEnrolled(): boolean {
    return this.enrollment !== null;
  }

  /**
   * Check if current user is admin
   */
  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  getTotalLessons(): number {
    return this.sections.reduce((total, section) => total + section.lessons.length, 0);
  }

  getTotalDuration(): number {
    let total = 0;
    this.sections.forEach(section => {
      section.lessons.forEach(lesson => {
        total += lesson.duration || 0;
      });
    });
    return total;
  }

  getLessonIcon(type: string): string {
    switch (type) {
      case 'video':
        return 'play_circle_outline';
      case 'text':
        return 'article';
      case 'quiz':
        return 'quiz';
      case 'assignment':
        return 'assignment';
      default:
        return 'description';
    }
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }

  getSectionDuration(section: CourseSection): number {
    return section.lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0);
  }
}
