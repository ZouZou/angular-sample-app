import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-performance-badge',
  templateUrl: './performance-badge.component.html',
  styleUrls: ['./performance-badge.component.scss'],
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PerformanceBadgeComponent {
  @Input() score!: number;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() showLabel = true;

  getBadgeClass(): string {
    if (this.score >= 80) return 'badge-high';
    if (this.score >= 60) return 'badge-medium';
    return 'badge-low';
  }

  getLabel(): string {
    if (this.score >= 80) return 'Excellent';
    if (this.score >= 60) return 'Good';
    return 'Needs Improvement';
  }
}
