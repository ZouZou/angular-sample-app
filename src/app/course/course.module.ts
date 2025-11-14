import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { LayoutModule } from '@angular/cdk/layout';

// Course Module Components
import { CourseRoutingModule } from './course-routing.module';
import { CourseListComponent } from './components/course-list/course-list.component';
import { CourseFormComponent } from './components/course-form/course-form.component';
import { CourseDetailComponent } from './components/course-detail/course-detail.component';
import { CoursePlayerComponent } from './components/player/course-player/course-player.component';
import { LessonViewerComponent } from './components/player/lesson-viewer/lesson-viewer.component';
import { QuizPlayerComponent } from './components/quiz/quiz-player/quiz-player.component';
import { QuizResultComponent } from './components/quiz/quiz-result/quiz-result.component';
import { CurriculumManagerComponent } from './components/course-form/curriculum-manager/curriculum-manager.component';
import { SectionFormComponent } from './components/course-form/section-form/section-form.component';
import { LessonFormComponent } from './components/course-form/lesson-form/lesson-form.component';

// Pipes
import { MarkdownPipe } from './pipes/markdown.pipe';

// Shared Modules
import { SharedModule } from '../shared/shared.module';
import { MaterialModule } from '../shared/material.module';

@NgModule({
  declarations: [
    CourseListComponent,
    CourseFormComponent,
    CourseDetailComponent,
    CoursePlayerComponent,
    LessonViewerComponent,
    QuizPlayerComponent,
    QuizResultComponent,
    CurriculumManagerComponent,
    SectionFormComponent,
    LessonFormComponent,
    MarkdownPipe
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    CourseRoutingModule,
    LayoutModule,
    MaterialModule,
    SharedModule
  ]
})
export class CourseModule { }
