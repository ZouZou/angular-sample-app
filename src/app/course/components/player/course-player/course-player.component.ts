import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CurriculumService } from '../../../services/curriculum.service';
import { EnrollmentService } from '../../../services/enrollment.service';
import { ProgressService } from '../../../services/progress.service';
import { AuthService } from '../../../services/auth.service';
import { CourseService } from '../../../services/course.service';
import { LoggerService } from '../../../../shared/services/logger.service';
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
  sidebarCollapsed = false;

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
    private authService: AuthService,
    private logger: LoggerService
  ) {}

  // Keyboard navigation
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    // Only handle if not typing in an input/textarea
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return;
    }

    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        if (this.hasNextLesson()) {
          this.goToNextLesson();
        }
        break;
      case 'ArrowLeft':
        event.preventDefault();
        if (this.hasPreviousLesson()) {
          this.goToPreviousLesson();
        }
        break;
      case 'Escape':
        event.preventDefault();
        this.exitCourse();
        break;
    }
  }

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
        this.logger.error('Error loading course data:', error);
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
            this.logger.error('Error loading progress:', error);
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

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  isSectionExpanded(sectionIndex: number): boolean {
    // Expand section if it contains the current lesson
    if (!this.currentLesson) {
      return sectionIndex === 0; // Expand first section by default
    }
    return this.sections[sectionIndex]?.lessons.some(l => l.id === this.currentLesson!.id) || false;
  }

  getSectionProgress(section: CourseSection): number {
    const sectionLessonIds = section.lessons.map(l => l.id);
    const completedInSection = sectionLessonIds.filter(id =>
      id !== undefined && this.completedLessonIds.includes(id)
    ).length;
    return section.lessons.length > 0
      ? Math.round((completedInSection / section.lessons.length) * 100)
      : 0;
  }

  getLessonTypeLabel(type: string): string {
    switch (type) {
      case 'video':
        return 'Video';
      case 'text':
        return 'Reading';
      case 'quiz':
        return 'Quiz';
      case 'assignment':
        return 'Assignment';
      default:
        return 'Lesson';
    }
  }

  getTotalDuration(): number {
    return this.sections.reduce((total, section) => {
      return total + section.lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0);
    }, 0);
  }

  getCurrentLessonPosition(): string {
    if (!this.currentLesson) return '';
    const allLessons = this.sections.flatMap(s => s.lessons);
    const currentIndex = allLessons.findIndex(l => l.id === this.currentLesson!.id);
    return `Lesson ${currentIndex + 1} of ${allLessons.length}`;
  }
}
