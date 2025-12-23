import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RecommendationService, Recommendation } from '../../course/services/recommendation.service';
import { RecommendationCardComponent } from '../../course/components/recommendation-card/recommendation-card.component';
import { fadeInUp, staggerList } from '../../shared/animations/animations';

@Component({
  selector: 'app-recommended-courses',
  templateUrl: './recommended-courses.component.html',
  styleUrls: ['./recommended-courses.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RecommendationCardComponent
  ],
  animations: [fadeInUp, staggerList],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecommendedCoursesComponent implements OnInit {
  private recommendationService = inject(RecommendationService);
  private cdr = inject(ChangeDetectorRef);

  recommendations: Recommendation[] = [];
  isLoading = true;
  error: string | null = null;

  // Display configuration
  readonly displayLimit = 6; // Show max 6 recommendations on dashboard

  ngOnInit(): void {
    this.loadRecommendations();
  }

  /**
   * Load personalized recommendations
   */
  loadRecommendations(): void {
    this.isLoading = true;
    this.error = null;
    this.cdr.markForCheck();

    this.recommendationService
      .getPersonalizedRecommendations(this.displayLimit, true)
      .subscribe({
        next: (recommendations) => {
          this.recommendations = recommendations;
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error loading recommendations:', error);
          this.error = 'Failed to load recommendations';
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
  }

  /**
   * Refresh recommendations
   */
  refresh(): void {
    this.loadRecommendations();
  }
}
