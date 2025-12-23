import { Component, Input, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Recommendation, RecommendationService } from '../../services/recommendation.service';
import { scaleIn } from '../../../shared/animations/animations';

@Component({
  selector: 'app-recommendation-card',
  templateUrl: './recommendation-card.component.html',
  styleUrls: ['./recommendation-card.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule
  ],
  animations: [scaleIn],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecommendationCardComponent {
  private router = inject(Router);
  private recommendationService = inject(RecommendationService);

  @Input() recommendation!: Recommendation;
  @Input() showReason = true;
  @Input() compact = false;

  /**
   * Navigate to course detail page
   */
  viewCourse(): void {
    if (this.recommendation?.course?.id) {
      this.router.navigate(['/courses', this.recommendation.course.id]);
    }
  }

  /**
   * Get the icon for the recommendation reason
   */
  get reasonIcon(): string {
    return this.recommendationService.getReasonIcon(this.recommendation.reasonType);
  }

  /**
   * Get the color for the recommendation reason badge
   */
  get reasonColor(): string {
    return this.recommendationService.getReasonColor(this.recommendation.reasonType);
  }

  /**
   * Get match score as percentage
   */
  get matchPercentage(): number {
    return Math.round(this.recommendation.matchScore * 100);
  }

  /**
   * Format duration in hours
   */
  get formattedDuration(): string {
    const duration = this.recommendation.course.duration;
    if (!duration) return 'N/A';

    if (duration < 1) {
      return `${Math.round(duration * 60)} min`;
    }
    return `${duration} hrs`;
  }

  /**
   * Get star rating array for display
   */
  get starRating(): number[] {
    const rating = this.recommendation.course.rating || 0;
    return Array(5).fill(0).map((_, i) => i < Math.round(rating) ? 1 : 0);
  }
}
