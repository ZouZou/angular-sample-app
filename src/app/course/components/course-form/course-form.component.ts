import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '../../services/course.service';
import { CourseFormService } from '../../services/course-form.service';
import { Course } from '../../models/course.interface';
import { LoggerService } from '../../../shared/services/logger.service';

@Component({
  selector: 'app-course-form',
  templateUrl: './course-form.component.html',
  styleUrls: ['./course-form.component.css'],
  standalone: false
})
export class CourseFormComponent implements OnInit {
  courseForm!: FormGroup;
  isEditMode = false;
  isLoading = false;
  isSaving = false;
  courseId: number | null = null;
  error: string | null = null;

  categories = ['Web Development', 'Programming', 'Data Science', 'Design', 'Business', 'Marketing', 'Other'];
  levels: ('Beginner' | 'Intermediate' | 'Advanced')[] = ['Beginner', 'Intermediate', 'Advanced'];

  constructor(
    private courseService: CourseService,
    private courseFormService: CourseFormService,
    private route: ActivatedRoute,
    private router: Router,
    private logger: LoggerService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.checkEditMode();
  }

  initializeForm(): void {
    this.courseForm = this.courseFormService.createCourseForm();
  }

  checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id && id !== 'new') {
      this.isEditMode = true;
      this.courseId = parseInt(id, 10);
      this.loadCourse(this.courseId);
    }
  }

  loadCourse(id: number): void {
    this.isLoading = true;
    this.error = null;

    this.courseService.getCourse(id).subscribe({
      next: (course) => {
        this.courseFormService.populateForm(this.courseForm, course);
        this.isLoading = false;
      },
      error: (error) => {
        this.logger.error('Error loading course:', error);
        this.error = 'Failed to load course. Please try again.';
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.courseForm.invalid) {
      this.courseForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.error = null;

    const courseData: Course = this.courseFormService.getFormData(this.courseForm);

    const operation = this.isEditMode && this.courseId
      ? this.courseService.updateCourse(this.courseId, courseData)
      : this.courseService.createCourse(courseData);

    operation.subscribe({
      next: (course) => {
        this.isSaving = false;
        this.router.navigate(['/courses', course.id]);
      },
      error: (error) => {
        this.logger.error('Error saving course:', error);
        this.error = `Failed to ${this.isEditMode ? 'update' : 'create'} course. Please try again.`;
        this.isSaving = false;
      }
    });
  }

  onCancel(): void {
    if (this.isEditMode && this.courseId) {
      this.router.navigate(['/courses', this.courseId]);
    } else {
      this.router.navigate(['/courses']);
    }
  }

  getErrorMessage(fieldName: string): string {
    return this.courseFormService.getErrorMessage(this.courseForm, fieldName);
  }

  hasError(fieldName: string): boolean {
    return this.courseFormService.hasError(this.courseForm, fieldName);
  }
}
