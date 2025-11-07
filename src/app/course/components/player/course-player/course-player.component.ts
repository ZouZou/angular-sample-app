import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CurriculumService } from '../../../services/curriculum.service';
import { EnrollmentService } from '../../../services/enrollment.service';
import { ProgressService } from '../../../services/progress.service';
import { AuthService } from '../../../services/auth.service';
import { CourseService } from '../../../services/course.service';
import { Course } from '../../../models/course.interface';
import { CourseSection, Lesson } from '../../../models/curriculum.interface';
import { Enrollment } from '../../../models/enrollment.interface';

@Component({
  selector: 'app-course-player',
  templateUrl: './course-player.component.html',
  styleUrls: ['./course-player.component.css'],
  standalone: false
})
export class CoursePlayerComponent implements OnInit, OnDestroy {
  course: Course | null = null;
  sections: CourseSection[] = [];
  enrollment: Enrollment | null = null;
  currentLesson: Lesson | null = null;
  completedLessonIds: number[] = [];
  isLoading = true;
  error: string | null = null;

  private destroy$ = new Subject<void>();
  private courseId!: number;
  private userId!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private curriculumService: CurriculumService,
    private enrollmentService: EnrollmentService,
    private progressService: ProgressService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.userId = this.authService.currentUserId || 1;

    if (id) {
      this.courseId = parseInt(id, 10);
      this.loadCourseData();
    } else {
      this.error = 'Invalid course ID';
      this.isLoading = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCourseData(): void {
    this.isLoading = true;
    this.error = null;

    combineLatest([
      this.courseService.getCourse(this.courseId),
      this.curriculumService.getCourseSections(this.courseId),
      this.enrollmentService.getEnrollment(this.userId, this.courseId)
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: ([course, sections, enrollment]) => {
        this.course = course;
        this.sections = sections.sort((a, b) => a.order - b.order);
        this.enrollment = enrollment;

        // Sort lessons within sections
        this.sections.forEach(section => {
          section.lessons.sort((a, b) => a.order - b.order);
        });

        if (enrollment) {
          this.loadProgress();
        } else {
          // Not enrolled, redirect to course detail
          this.router.navigate(['/courses', this.courseId]);
        }

        // Load first lesson by default
        if (this.sections.length > 0 && this.sections[0].lessons.length > 0) {
          this.selectLesson(this.sections[0].lessons[0]);
        }

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading course data:', error);
        this.error = 'Failed to load course. Please try again.';
        this.isLoading = false;
      }
    });
  }

  loadProgress(): void {
    if (this.enrollment) {
      this.progressService.getCompletedLessonIds(this.enrollment.id!)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (lessonIds) => {
            this.completedLessonIds = lessonIds;
          },
          error: (error) => {
            console.error('Error loading progress:', error);
          }
        });
    }
  }

  selectLesson(lesson: Lesson): void {
    this.currentLesson = lesson;

    // Update last accessed date
    if (this.enrollment) {
      this.enrollment.lastAccessedDate = new Date();
    }

    // Navigate based on lesson type
    if (lesson.type === 'quiz' && lesson.quizId) {
      this.router.navigate(['/courses', this.courseId, 'learn', 'quiz', lesson.quizId]);
    } else {
      this.router.navigate(['/courses', this.courseId, 'learn', 'lesson', lesson.id]);
    }
  }

  isLessonCompleted(lessonId: number | undefined): boolean {
    return lessonId ? this.completedLessonIds.includes(lessonId) : false;
  }

  getLessonIcon(type: string): string {
    switch (type) {
      case 'video':
        return 'play_circle_outline';
      case 'text':
        return 'article';
      case 'quiz':
        return 'quiz';
      case 'assignment':
        return 'assignment';
      default:
        return 'description';
    }
  }

  getTotalLessons(): number {
    return this.sections.reduce((total, section) => total + section.lessons.length, 0);
  }

  getCompletedLessons(): number {
    return this.completedLessonIds.length;
  }

  getProgressPercentage(): number {
    const total = this.getTotalLessons();
    return total > 0 ? Math.round((this.getCompletedLessons() / total) * 100) : 0;
  }

  exitCourse(): void {
    this.router.navigate(['/courses', this.courseId]);
  }

  goToNextLesson(): void {
    if (!this.currentLesson) return;

    const allLessons = this.sections.flatMap(s => s.lessons);
    const currentIndex = allLessons.findIndex(l => l.id === this.currentLesson!.id);

    if (currentIndex >= 0 && currentIndex < allLessons.length - 1) {
      this.selectLesson(allLessons[currentIndex + 1]);
    }
  }

  goToPreviousLesson(): void {
    if (!this.currentLesson) return;

    const allLessons = this.sections.flatMap(s => s.lessons);
    const currentIndex = allLessons.findIndex(l => l.id === this.currentLesson!.id);

    if (currentIndex > 0) {
      this.selectLesson(allLessons[currentIndex - 1]);
    }
  }

  hasNextLesson(): boolean {
    if (!this.currentLesson) return false;
    const allLessons = this.sections.flatMap(s => s.lessons);
    const currentIndex = allLessons.findIndex(l => l.id === this.currentLesson!.id);
    return currentIndex >= 0 && currentIndex < allLessons.length - 1;
  }

  hasPreviousLesson(): boolean {
    if (!this.currentLesson) return false;
    const allLessons = this.sections.flatMap(s => s.lessons);
    const currentIndex = allLessons.findIndex(l => l.id === this.currentLesson!.id);
    return currentIndex > 0;
  }
}
