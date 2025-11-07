import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '../../services/course.service';
import { Course } from '../../models/course.interface';

@Component({
  selector: 'app-course-detail',
  templateUrl: './course-detail.component.html',
  styleUrls: ['./course-detail.component.css'],
  standalone: false
})
export class CourseDetailComponent implements OnInit {
  course: Course | null = null;
  isLoading = false;
  error: string | null = null;

  constructor(
    private courseService: CourseService,
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
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading course:', error);
        this.error = 'Failed to load course. The course may not exist.';
        this.isLoading = false;
      }
    });
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
    if (this.course) {
      alert(`Enrollment functionality would be implemented here for: ${this.course.title}`);
      // In a real application, this would handle enrollment logic
    }
  }
}
