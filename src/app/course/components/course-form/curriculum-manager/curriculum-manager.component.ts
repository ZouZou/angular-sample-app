import { Component, input, OnChanges, SimpleChanges, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { CurriculumService } from '../../../services/curriculum.service';
import { CourseSection, Lesson } from '../../../models/curriculum.interface';
import { LoggerService } from '../../../../shared/services/logger.service';
import { SectionFormComponent } from '../section-form/section-form.component';
import { LessonFormComponent } from '../lesson-form/lesson-form.component';

@Component({
  selector: 'app-curriculum-manager',
  templateUrl: './curriculum-manager.component.html',
  styleUrls: ['./curriculum-manager.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatCardModule,
    SectionFormComponent,
    LessonFormComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CurriculumManagerComponent implements OnChanges {
  private curriculumService = inject(CurriculumService);
  private logger = inject(LoggerService);

  courseId = input<number | null>(null);

  sections: CourseSection[] = [];
  isLoadingCurriculum = false;
  editingSection: CourseSection | null = null;
  editingLesson: { section: CourseSection; lesson: Lesson | null } | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['courseId'] && this.courseId()) {
      this.loadCurriculum(this.courseId()!);
    }
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
        this.logger.error('Error loading curriculum:', error);
        this.isLoadingCurriculum = false;
      }
    });
  }

  // ============================================
  // SECTION MANAGEMENT
  // ============================================

  startAddSection(): void {
    this.editingSection = {
      courseId: this.courseId()!,
      title: '',
      description: '',
      order: this.sections.length + 1,
      lessons: []
    };
  }

  startEditSection(section: CourseSection): void {
    this.editingSection = { ...section };
  }

  cancelEditSection(): void {
    this.editingSection = null;
  }

  saveSection(formData: { title: string; description: string }): void {
    if (!this.courseId()) {
      return;
    }

    const sectionData: Partial<CourseSection> = {
      courseId: this.courseId()!,
      title: formData.title,
      description: formData.description,
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
          this.logger.error('Error updating section:', error);
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
          this.logger.error('Error creating section:', error);
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
        this.logger.error('Error deleting section:', error);
        alert('Failed to delete section. Please try again.');
      }
    });
  }

  moveSectionUp(section: CourseSection): void {
    const index = this.sections.findIndex(s => s.id === section.id);
    if (index > 0) {
      [this.sections[index - 1], this.sections[index]] = [this.sections[index], this.sections[index - 1]];
      this.reorderSections();
    }
  }

  moveSectionDown(section: CourseSection): void {
    const index = this.sections.findIndex(s => s.id === section.id);
    if (index < this.sections.length - 1) {
      [this.sections[index], this.sections[index + 1]] = [this.sections[index + 1], this.sections[index]];
      this.reorderSections();
    }
  }

  private reorderSections(): void {
    this.sections.forEach((section, index) => {
      section.order = index + 1;
    });

    const sectionIds = this.sections.map(s => s.id!).filter(id => id !== undefined);
    if (sectionIds.length > 0 && this.courseId()) {
      this.curriculumService.reorderSections(this.courseId()!, sectionIds).subscribe({
        error: (error) => this.logger.error('Error reordering sections:', error)
      });
    }
  }

  // ============================================
  // LESSON MANAGEMENT
  // ============================================

  startAddLesson(section: CourseSection): void {
    this.editingLesson = { section, lesson: null };
  }

  startEditLesson(section: CourseSection, lesson: Lesson): void {
    this.editingLesson = { section, lesson: { ...lesson } };
  }

  cancelEditLesson(): void {
    this.editingLesson = null;
  }

  saveLesson(lessonData: Partial<Lesson>): void {
    if (!this.editingLesson?.section.id) {
      return;
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
          this.logger.error('Error updating lesson:', error);
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
          this.logger.error('Error creating lesson:', error);
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
        this.logger.error('Error deleting lesson:', error);
        alert('Failed to delete lesson. Please try again.');
      }
    });
  }

  moveLessonUp(section: CourseSection, lesson: Lesson): void {
    const index = section.lessons.findIndex(l => l.id === lesson.id);
    if (index > 0) {
      [section.lessons[index - 1], section.lessons[index]] = [section.lessons[index], section.lessons[index - 1]];
      this.reorderLessons(section);
    }
  }

  moveLessonDown(section: CourseSection, lesson: Lesson): void {
    const index = section.lessons.findIndex(l => l.id === lesson.id);
    if (index < section.lessons.length - 1) {
      [section.lessons[index], section.lessons[index + 1]] = [section.lessons[index + 1], section.lessons[index]];
      this.reorderLessons(section);
    }
  }

  private reorderLessons(section: CourseSection): void {
    section.lessons.forEach((lesson, index) => {
      lesson.order = index + 1;
    });

    const lessonIds = section.lessons.map(l => l.id!).filter(id => id !== undefined);
    if (lessonIds.length > 0 && section.id) {
      this.curriculumService.reorderLessons(section.id, lessonIds).subscribe({
        error: (error) => this.logger.error('Error reordering lessons:', error)
      });
    }
  }

  // Helper methods
  getLessonTypeIcon(type: string): string {
    switch (type) {
      case 'video': return 'play_circle';
      case 'text': return 'article';
      case 'quiz': return 'quiz';
      case 'assignment': return 'assignment';
      default: return 'help';
    }
  }
}
