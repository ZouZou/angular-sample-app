import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material.module';
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
    MaterialModule,
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
