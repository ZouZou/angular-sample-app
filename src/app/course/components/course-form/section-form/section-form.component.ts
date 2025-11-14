import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CourseSection } from '../../../models/curriculum.interface';

@Component({
  selector: 'app-section-form',
  templateUrl: './section-form.component.html',
  styleUrls: ['./section-form.component.css'],
  standalone: false
})
export class SectionFormComponent implements OnChanges {
  @Input() section: CourseSection | null = null;
  @Input() sectionsCount = 0;
  @Output() save = new EventEmitter<{ title: string; description: string }>();
  @Output() cancel = new EventEmitter<void>();

  sectionForm: { title: string; description: string } = { title: '', description: '' };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['section'] && this.section) {
      this.sectionForm = {
        title: this.section.title || '',
        description: this.section.description || ''
      };
    }
  }

  onSave(): void {
    if (this.sectionForm.title.trim()) {
      this.save.emit({
        title: this.sectionForm.title.trim(),
        description: this.sectionForm.description.trim()
      });
    }
  }

  onCancel(): void {
    this.cancel.emit();
    this.resetForm();
  }

  private resetForm(): void {
    this.sectionForm = { title: '', description: '' };
  }
}
