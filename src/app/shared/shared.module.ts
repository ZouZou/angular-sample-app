import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { SkeletonCourseCardComponent } from './components/skeleton-course-card/skeleton-course-card.component';
import { PwaInstallPromptComponent } from './components/pwa-install-prompt/pwa-install-prompt.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { CharacterCounterDirective } from './directives/character-counter.directive';
import { PhoneMaskDirective } from './directives/phone-mask.directive';
import { LazyLoadImageDirective } from './directives/lazy-load-image.directive';

@NgModule({
  declarations: [
    PwaInstallPromptComponent,
    FileUploadComponent,
    CharacterCounterDirective,
    PhoneMaskDirective
  ],
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    LoadingSpinnerComponent,
    ConfirmationDialogComponent,
    SkeletonCourseCardComponent,
    LazyLoadImageDirective
  ],
  exports: [
    LoadingSpinnerComponent,
    ConfirmationDialogComponent,
    SkeletonCourseCardComponent,
    PwaInstallPromptComponent,
    FileUploadComponent,
    CharacterCounterDirective,
    PhoneMaskDirective,
    LazyLoadImageDirective
  ]
})
export class SharedModule { }
