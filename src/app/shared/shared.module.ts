import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { SkeletonCourseCardComponent } from './components/skeleton-course-card/skeleton-course-card.component';

@NgModule({
  declarations: [
    LoadingSpinnerComponent,
    ConfirmationDialogComponent,
    SkeletonCourseCardComponent
  ],
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatButtonModule,
    MatCardModule
  ],
  exports: [
    LoadingSpinnerComponent,
    ConfirmationDialogComponent,
    SkeletonCourseCardComponent
  ]
})
export class SharedModule { }
