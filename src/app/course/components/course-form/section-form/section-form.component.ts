import { Component, input, output, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CourseSection } from '../../../models/curriculum.interface';

@Component({
  selector: 'app-section-form',
  templateUrl: './section-form.component.html',
  styleUrls: ['./section-form.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SectionFormComponent implements OnChanges {
  section = input<CourseSection | null>(null);
  sectionsCount = input<number>(0);
  save = output<{ title: string; description: string }>();
  cancel = output<void>();

  sectionForm: { title: string; description: string } = { title: '', description: '' };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['section'] && this.section()) {
      this.sectionForm = {
        title: this.section()!.title || '',
        description: this.section()!.description || ''
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
