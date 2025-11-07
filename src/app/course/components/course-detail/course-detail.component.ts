import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '../../services/course.service';
import { EnrollmentService } from '../../services/enrollment.service';
import { AuthService } from '../../services/auth.service';
import { Course } from '../../models/course.interface';
import { Enrollment } from '../../models/enrollment.interface';

@Component({
  selector: 'app-course-detail',
  templateUrl: './course-detail.component.html',
  styleUrls: ['./course-detail.component.css'],
  standalone: false
})
export class CourseDetailComponent implements OnInit {
  course: Course | null = null;
  enrollment: Enrollment | null = null;
  isLoading = false;
  isEnrolling = false;
  error: string | null = null;

  constructor(
    private courseService: CourseService,
    private enrollmentService: EnrollmentService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
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
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading course:', error);
        this.error = 'Failed to load course. The course may not exist.';
        this.isLoading = false;
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

    if (confirm(`Are you sure you want to delete "${this.course.title}"? This action cannot be undone.`)) {
      this.courseService.deleteCourse(this.course.id).subscribe({
        next: () => {
          this.router.navigate(['/courses']);
        },
        error: (error) => {
          console.error('Error deleting course:', error);
          alert('Failed to delete course. Please try again.');
        }
      });
    }
  }

  getLevelColor(level: string): string {
    switch (level) {
      case 'Beginner':
        return '#4caf50';
      case 'Intermediate':
        return '#ff9800';
      case 'Advanced':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  }

  enrollCourse(): void {
    if (!this.course?.id) return;

    const userId = this.authService.currentUserId;
    if (!userId) {
      alert('Please log in to enroll in courses');
      return;
    }

    this.isEnrolling = true;

    this.enrollmentService.enrollInCourse(userId, this.course.id).subscribe({
      next: (enrollment) => {
        this.enrollment = enrollment;
        this.isEnrolling = false;
        // Navigate to course player
        this.router.navigate(['/courses', this.course!.id, 'learn']);
      },
      error: (error) => {
        console.error('Error enrolling in course:', error);
        alert(error.message || 'Failed to enroll in course. Please try again.');
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
}
