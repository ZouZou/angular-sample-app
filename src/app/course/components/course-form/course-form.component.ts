import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '../../services/course.service';
import { CurriculumService } from '../../services/curriculum.service';
import { Course } from '../../models/course.interface';
import { CourseSection, Lesson } from '../../models/curriculum.interface';
import { forkJoin } from 'rxjs';

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
  lessonTypes: Array<'video' | 'text' | 'quiz' | 'assignment'> = ['video', 'text', 'quiz', 'assignment'];

  // Curriculum management
  sections: CourseSection[] = [];
  isLoadingCurriculum = false;
  editingSection: CourseSection | null = null;
  editingLesson: { section: CourseSection; lesson: Lesson | null } | null = null;

  // Section form data
  sectionForm: { title: string; description: string } = { title: '', description: '' };

  // Lesson form data
  lessonForm: Partial<Lesson> = {
    title: '',
    description: '',
    type: 'video',
    duration: 0,
    videoUrl: '',
    content: '',
    quizId: undefined
  };

  constructor(
    private formBuilder: FormBuilder,
    private courseService: CourseService,
    private curriculumService: CurriculumService,
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
        // Load curriculum for edit mode
        this.loadCurriculum(id);
      },
      error: (error) => {
        console.error('Error loading course:', error);
        this.error = 'Failed to load course. Please try again.';
        this.isLoading = false;
      }
    });
  }

  loadCurriculum(courseId: number): void {
    this.isLoadingCurriculum = true;
    this.curriculumService.getCourseSections(courseId).subscribe({
      next: (sections) => {
        this.sections = sections.sort((a, b) => a.order - b.order);
        this.sections.forEach(section => {
          section.lessons = section.lessons?.sort((a, b) => a.order - b.order) || [];
        });
        this.isLoadingCurriculum = false;
      },
      error: (error) => {
        console.error('Error loading curriculum:', error);
        this.isLoadingCurriculum = false;
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

  // ============================================
  // SECTION MANAGEMENT
  // ============================================

  startAddSection(): void {
    this.editingSection = {
      courseId: this.courseId!,
      title: '',
      description: '',
      order: this.sections.length + 1,
      lessons: []
    };
    this.sectionForm = { title: '', description: '' };
  }

  startEditSection(section: CourseSection): void {
    this.editingSection = { ...section };
    this.sectionForm = {
      title: section.title,
      description: section.description || ''
    };
  }

  cancelEditSection(): void {
    this.editingSection = null;
    this.sectionForm = { title: '', description: '' };
  }

  saveSection(): void {
    if (!this.sectionForm.title.trim() || !this.courseId) {
      return;
    }

    const sectionData: Partial<CourseSection> = {
      courseId: this.courseId,
      title: this.sectionForm.title.trim(),
      description: this.sectionForm.description?.trim() || '',
      order: this.editingSection?.order || this.sections.length + 1
    };

    if (this.editingSection?.id) {
      // Update existing section
      this.curriculumService.updateSection(this.editingSection.id, sectionData).subscribe({
        next: (updatedSection) => {
          const index = this.sections.findIndex(s => s.id === updatedSection.id);
          if (index !== -1) {
            this.sections[index] = { ...this.sections[index], ...updatedSection };
          }
          this.cancelEditSection();
        },
        error: (error) => {
          console.error('Error updating section:', error);
          alert('Failed to update section. Please try again.');
        }
      });
    } else {
      // Create new section
      this.curriculumService.createSection(sectionData).subscribe({
        next: (newSection) => {
          this.sections.push({ ...newSection, lessons: [] });
          this.sections.sort((a, b) => a.order - b.order);
          this.cancelEditSection();
        },
        error: (error) => {
          console.error('Error creating section:', error);
          alert('Failed to create section. Please try again.');
        }
      });
    }
  }

  deleteSection(section: CourseSection): void {
    if (!section.id) return;

    if (!confirm(`Are you sure you want to delete the section "${section.title}"? This will also delete all lessons in this section.`)) {
      return;
    }

    this.curriculumService.deleteSection(section.id).subscribe({
      next: () => {
        this.sections = this.sections.filter(s => s.id !== section.id);
        this.reorderSections();
      },
      error: (error) => {
        console.error('Error deleting section:', error);
        alert('Failed to delete section. Please try again.');
      }
    });
  }

  moveSectionUp(section: CourseSection): void {
    const index = this.sections.findIndex(s => s.id === section.id);
    if (index > 0) {
      // Swap with previous section
      [this.sections[index - 1], this.sections[index]] = [this.sections[index], this.sections[index - 1]];
      this.reorderSections();
    }
  }

  moveSectionDown(section: CourseSection): void {
    const index = this.sections.findIndex(s => s.id === section.id);
    if (index < this.sections.length - 1) {
      // Swap with next section
      [this.sections[index], this.sections[index + 1]] = [this.sections[index + 1], this.sections[index]];
      this.reorderSections();
    }
  }

  private reorderSections(): void {
    // Update order numbers
    this.sections.forEach((section, index) => {
      section.order = index + 1;
    });

    // Save to backend
    const sectionIds = this.sections.map(s => s.id!).filter(id => id !== undefined);
    if (sectionIds.length > 0 && this.courseId) {
      this.curriculumService.reorderSections(this.courseId, sectionIds).subscribe({
        error: (error) => console.error('Error reordering sections:', error)
      });
    }
  }

  // ============================================
  // LESSON MANAGEMENT
  // ============================================

  startAddLesson(section: CourseSection): void {
    this.editingLesson = { section, lesson: null };
    this.lessonForm = {
      title: '',
      description: '',
      type: 'video',
      duration: 0,
      videoUrl: '',
      content: '',
      quizId: undefined,
      sectionId: section.id,
      order: (section.lessons?.length || 0) + 1
    };
  }

  startEditLesson(section: CourseSection, lesson: Lesson): void {
    this.editingLesson = { section, lesson: { ...lesson } };
    this.lessonForm = { ...lesson };
  }

  cancelEditLesson(): void {
    this.editingLesson = null;
    this.lessonForm = {
      title: '',
      description: '',
      type: 'video',
      duration: 0,
      videoUrl: '',
      content: '',
      quizId: undefined
    };
  }

  saveLesson(): void {
    if (!this.lessonForm.title?.trim() || !this.editingLesson?.section.id) {
      return;
    }

    const lessonData: Partial<Lesson> = {
      sectionId: this.editingLesson.section.id,
      title: this.lessonForm.title.trim(),
      description: this.lessonForm.description?.trim() || '',
      type: this.lessonForm.type || 'video',
      duration: this.lessonForm.duration || 0,
      order: this.lessonForm.order || (this.editingLesson.section.lessons?.length || 0) + 1
    };

    // Add type-specific fields
    if (lessonData.type === 'video') {
      lessonData.videoUrl = this.lessonForm.videoUrl?.trim() || '';
    } else if (lessonData.type === 'text') {
      lessonData.content = this.lessonForm.content?.trim() || '';
    } else if (lessonData.type === 'quiz') {
      lessonData.quizId = this.lessonForm.quizId;
    } else if (lessonData.type === 'assignment') {
      lessonData.content = this.lessonForm.content?.trim() || '';
    }

    if (this.editingLesson.lesson?.id) {
      // Update existing lesson
      this.curriculumService.updateLesson(this.editingLesson.lesson.id, lessonData).subscribe({
        next: (updatedLesson) => {
          const section = this.sections.find(s => s.id === this.editingLesson?.section.id);
          if (section) {
            const lessonIndex = section.lessons.findIndex(l => l.id === updatedLesson.id);
            if (lessonIndex !== -1) {
              section.lessons[lessonIndex] = updatedLesson;
            }
          }
          this.cancelEditLesson();
        },
        error: (error) => {
          console.error('Error updating lesson:', error);
          alert('Failed to update lesson. Please try again.');
        }
      });
    } else {
      // Create new lesson
      this.curriculumService.createLesson(lessonData).subscribe({
        next: (newLesson) => {
          const section = this.sections.find(s => s.id === this.editingLesson?.section.id);
          if (section) {
            if (!section.lessons) section.lessons = [];
            section.lessons.push(newLesson);
            section.lessons.sort((a, b) => a.order - b.order);
          }
          this.cancelEditLesson();
        },
        error: (error) => {
          console.error('Error creating lesson:', error);
          alert('Failed to create lesson. Please try again.');
        }
      });
    }
  }

  deleteLesson(section: CourseSection, lesson: Lesson): void {
    if (!lesson.id) return;

    if (!confirm(`Are you sure you want to delete the lesson "${lesson.title}"?`)) {
      return;
    }

    this.curriculumService.deleteLesson(lesson.id).subscribe({
      next: () => {
        section.lessons = section.lessons.filter(l => l.id !== lesson.id);
        this.reorderLessons(section);
      },
      error: (error) => {
        console.error('Error deleting lesson:', error);
        alert('Failed to delete lesson. Please try again.');
      }
    });
  }

  moveLessonUp(section: CourseSection, lesson: Lesson): void {
    const index = section.lessons.findIndex(l => l.id === lesson.id);
    if (index > 0) {
      // Swap with previous lesson
      [section.lessons[index - 1], section.lessons[index]] = [section.lessons[index], section.lessons[index - 1]];
      this.reorderLessons(section);
    }
  }

  moveLessonDown(section: CourseSection, lesson: Lesson): void {
    const index = section.lessons.findIndex(l => l.id === lesson.id);
    if (index < section.lessons.length - 1) {
      // Swap with next lesson
      [section.lessons[index], section.lessons[index + 1]] = [section.lessons[index + 1], section.lessons[index]];
      this.reorderLessons(section);
    }
  }

  private reorderLessons(section: CourseSection): void {
    // Update order numbers
    section.lessons.forEach((lesson, index) => {
      lesson.order = index + 1;
    });

    // Save to backend
    const lessonIds = section.lessons.map(l => l.id!).filter(id => id !== undefined);
    if (lessonIds.length > 0 && section.id) {
      this.curriculumService.reorderLessons(section.id, lessonIds).subscribe({
        error: (error) => console.error('Error reordering lessons:', error)
      });
    }
  }

  // Helper methods for lesson types
  getLessonTypeIcon(type: string): string {
    switch (type) {
      case 'video': return 'play_circle';
      case 'text': return 'article';
      case 'quiz': return 'quiz';
      case 'assignment': return 'assignment';
      default: return 'help';
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
