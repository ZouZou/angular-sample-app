import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Course } from '../models/course.interface';

@Injectable({
  providedIn: 'root'
})
export class CourseFormService {
  constructor(private formBuilder: FormBuilder) {}

  createCourseForm(): FormGroup {
    return this.formBuilder.group({
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

  populateForm(form: FormGroup, course: Course): void {
    form.patchValue({
      title: course.title,
      description: course.description,
      instructor: course.instructor,
      duration: course.duration,
      price: course.price,
      category: course.category,
      level: course.level,
      thumbnailUrl: course.thumbnailUrl || ''
    });
  }

  getFormData(form: FormGroup): Course {
    return {
      ...form.value,
      thumbnailUrl: form.value.thumbnailUrl || undefined
    };
  }

  getErrorMessage(form: FormGroup, fieldName: string): string {
    const control = form.get(fieldName);

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

  hasError(form: FormGroup, fieldName: string): boolean {
    const control = form.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  private getFieldLabel(fieldName: string): string {
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
}
