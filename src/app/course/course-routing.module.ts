import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CourseListComponent } from './components/course-list/course-list.component';
import { CourseFormComponent } from './components/course-form/course-form.component';
import { CourseDetailComponent } from './components/course-detail/course-detail.component';
import { CoursePlayerComponent } from './components/player/course-player/course-player.component';
import { LessonViewerComponent } from './components/player/lesson-viewer/lesson-viewer.component';
import { QuizPlayerComponent } from './components/quiz/quiz-player/quiz-player.component';
import { QuizResultComponent } from './components/quiz/quiz-result/quiz-result.component';

const routes: Routes = [
  {
    path: '',
    component: CourseListComponent
  },
  {
    path: 'new',
    component: CourseFormComponent
  },
  {
    path: ':id',
    component: CourseDetailComponent
  },
  {
    path: ':id/edit',
    component: CourseFormComponent
  },
  {
    path: ':id/learn',
    component: CoursePlayerComponent,
    children: [
      {
        path: 'lesson/:lessonId',
        component: LessonViewerComponent
      },
      {
        path: 'quiz/:quizId',
        component: QuizPlayerComponent
      },
      {
        path: 'quiz/:quizId/result/:attemptId',
        component: QuizResultComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CourseRoutingModule { }
