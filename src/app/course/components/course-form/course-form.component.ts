import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '../../services/course.service';
import { Course } from '../../models/course.interface';

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
    private formBuilder: FormBuilder,
    private courseService: CourseService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.checkEditMode();
  }

  initializeForm(): void {
    this.courseForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
      instructor: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      duration: [0, [Validators.required, Validators.min(1), Validators.max(1000)]],
      price: [0, [Validators.required, Validators.min(0), Validators.max(10000)]],
      category: ['', Validators.required],
      level: ['Beginner', Validators.required],
      thumbnailUrl: ['', [Validators.pattern('https?://.+')]]
    });
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
        this.courseForm.patchValue({
          title: course.title,
          description: course.description,
          instructor: course.instructor,
          duration: course.duration,
          price: course.price,
          category: course.category,
          level: course.level,
          thumbnailUrl: course.thumbnailUrl || ''
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading course:', error);
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

    const courseData: Course = {
      ...this.courseForm.value,
      thumbnailUrl: this.courseForm.value.thumbnailUrl || undefined
    };

    const operation = this.isEditMode && this.courseId
      ? this.courseService.updateCourse(this.courseId, courseData)
      : this.courseService.createCourse(courseData);

    operation.subscribe({
      next: (course) => {
        this.isSaving = false;
        this.router.navigate(['/courses', course.id]);
      },
      error: (error) => {
        console.error('Error saving course:', error);
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
    const control = this.courseForm.get(fieldName);

    if (!control || !control.errors || !control.touched) {
      return '';
    }

    if (control.errors['required']) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }

    if (control.errors['minlength']) {
      return `${this.getFieldLabel(fieldName)} must be at least ${control.errors['minlength'].requiredLength} characters`;
    }

    if (control.errors['maxlength']) {
      return `${this.getFieldLabel(fieldName)} must not exceed ${control.errors['maxlength'].requiredLength} characters`;
    }

    if (control.errors['min']) {
      return `${this.getFieldLabel(fieldName)} must be at least ${control.errors['min'].min}`;
    }

    if (control.errors['max']) {
      return `${this.getFieldLabel(fieldName)} must not exceed ${control.errors['max'].max}`;
    }

    if (control.errors['pattern']) {
      return `${this.getFieldLabel(fieldName)} must be a valid URL`;
    }

    return 'Invalid value';
  }

  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      title: 'Title',
      description: 'Description',
      instructor: 'Instructor',
      duration: 'Duration',
      price: 'Price',
      category: 'Category',
      level: 'Level',
      thumbnailUrl: 'Thumbnail URL'
    };
    return labels[fieldName] || fieldName;
  }

  hasError(fieldName: string): boolean {
    const control = this.courseForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }
}
