import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CourseSection, Lesson } from '../../../models/curriculum.interface';

@Component({
  selector: 'app-lesson-form',
  templateUrl: './lesson-form.component.html',
  styleUrls: ['./lesson-form.component.css'],
  standalone: false
})
export class LessonFormComponent implements OnChanges {
  @Input() lesson: Lesson | null = null;
  @Input() section: CourseSection | null = null;
  @Output() save = new EventEmitter<Partial<Lesson>>();
  @Output() cancel = new EventEmitter<void>();

  lessonTypes: Array<'video' | 'text' | 'quiz' | 'assignment'> = ['video', 'text', 'quiz', 'assignment'];

  lessonForm: Partial<Lesson> = {
    title: '',
    description: '',
    type: 'video',
    duration: 0,
    videoUrl: '',
    content: '',
    quizId: undefined
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['lesson'] && this.lesson) {
      this.lessonForm = { ...this.lesson };
    } else if (changes['section'] && this.section && !this.lesson) {
      this.resetForm();
    }
  }

  onSave(): void {
    if (this.lessonForm.title?.trim() && this.section?.id) {
      const lessonData: Partial<Lesson> = {
        sectionId: this.section.id,
        title: this.lessonForm.title.trim(),
        description: this.lessonForm.description?.trim() || '',
        type: this.lessonForm.type || 'video',
        duration: this.lessonForm.duration || 0,
        order: this.lessonForm.order || (this.section.lessons?.length || 0) + 1
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

      this.save.emit(lessonData);
    }
  }

  onCancel(): void {
    this.cancel.emit();
    this.resetForm();
  }

  getLessonTypeIcon(type: string): string {
    switch (type) {
      case 'video': return 'play_circle';
      case 'text': return 'article';
      case 'quiz': return 'quiz';
      case 'assignment': return 'assignment';
      default: return 'help';
    }
  }

  private resetForm(): void {
    this.lessonForm = {
      title: '',
      description: '',
      type: 'video',
      duration: 0,
      videoUrl: '',
      content: '',
      quizId: undefined,
      sectionId: this.section?.id,
      order: (this.section?.lessons?.length || 0) + 1
    };
  }
}
