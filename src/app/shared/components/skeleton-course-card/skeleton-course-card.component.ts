import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-skeleton-course-card',
  templateUrl: './skeleton-course-card.component.html',
  styleUrls: ['./skeleton-course-card.component.css'],
  standalone: true,
  imports: [CommonModule, MatCardModule]
})
export class SkeletonCourseCardComponent {}
