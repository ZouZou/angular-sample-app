import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CourseService } from '../../services/course.service';
import { AuthService } from '../../services/auth.service';
import { Course } from '../../models/course.interface';

@Component({
  selector: 'app-course-list',
  templateUrl: './course-list.component.html',
  styleUrls: ['./course-list.component.css'],
  standalone: false
})
export class CourseListComponent implements OnInit {
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
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.isLoading = true;
    this.error = null;

    this.courseService.getCourses().subscribe({
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

  navigateToDetail(courseId: number | undefined): void {
    if (courseId) {
      this.router.navigate(['/courses', courseId]);
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

  deleteCourse(event: Event, courseId: number | undefined): void {
    event.stopPropagation();
    if (!courseId) return;

    if (confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      this.courseService.deleteCourse(courseId).subscribe({
        next: () => {
          this.loadCourses();
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

  /**
   * Check if current user is admin
   */
  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}
