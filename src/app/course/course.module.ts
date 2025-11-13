import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';

// Course Module Components
import { CourseRoutingModule } from './course-routing.module';
import { CourseListComponent } from './components/course-list/course-list.component';
import { CourseFormComponent } from './components/course-form/course-form.component';
import { CourseDetailComponent } from './components/course-detail/course-detail.component';
import { CoursePlayerComponent } from './components/player/course-player/course-player.component';
import { LessonViewerComponent } from './components/player/lesson-viewer/lesson-viewer.component';
import { QuizPlayerComponent } from './components/quiz/quiz-player/quiz-player.component';
import { QuizResultComponent } from './components/quiz/quiz-result/quiz-result.component';

// Pipes
import { MarkdownPipe } from './pipes/markdown.pipe';

// Layout
import { LayoutModule } from '@angular/cdk/layout';

// Shared Module
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    CourseListComponent,
    CourseFormComponent,
    CourseDetailComponent,
    CoursePlayerComponent,
    LessonViewerComponent,
    QuizPlayerComponent,
    QuizResultComponent,
    MarkdownPipe
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    CourseRoutingModule,
    LayoutModule,
    SharedModule,
    // Material Modules
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatGridListModule,
    MatExpansionModule,
    MatListModule,
    MatRadioModule,
    MatCheckboxModule,
    MatTooltipModule
  ]
})
export class CourseModule { }
