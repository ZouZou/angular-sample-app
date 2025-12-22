import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-analytics-card',
  templateUrl: './analytics-card.component.html',
  styleUrls: ['./analytics-card.component.scss'],
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnalyticsCardComponent {
  @Input() title!: string;
  @Input() value!: number | string;
  @Input() icon!: string;
  @Input() color: 'primary' | 'accent' | 'warn' | 'success' | 'info' = 'primary';
  @Input() trend?: { value: number; direction: 'up' | 'down' };
  @Input() subtitle?: string;
}
