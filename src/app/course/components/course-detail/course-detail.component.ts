import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '../../services/course.service';
import { CurriculumService } from '../../services/curriculum.service';
import { EnrollmentService } from '../../services/enrollment.service';
import { AuthService } from '../../services/auth.service';
import { Course } from '../../models/course.interface';
import { Enrollment } from '../../models/enrollment.interface';
import { CourseSection } from '../../models/curriculum.interface';

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

  /**
   * Check if current user is admin
   */
  isAdmin(): boolean {
    return this.authService.isAdmin();
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
