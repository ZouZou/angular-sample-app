import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-spinner',
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.css'],
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingSpinnerComponent {
  message = input<string>('Loading...');
  diameter = input<number>(60);
}
