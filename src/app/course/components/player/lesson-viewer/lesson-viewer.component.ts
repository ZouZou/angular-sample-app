import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CurriculumService } from '../../../services/curriculum.service';
import { ProgressService } from '../../../services/progress.service';
import { EnrollmentService } from '../../../services/enrollment.service';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { Lesson } from '../../../models/curriculum.interface';

@Component({
  selector: 'app-lesson-viewer',
  templateUrl: './lesson-viewer.component.html',
  styleUrls: ['./lesson-viewer.component.css'],
  standalone: false,
  encapsulation: ViewEncapsulation.None
})
export class LessonViewerComponent implements OnInit, OnDestroy {
  lesson: Lesson | null = null;
  isLoading = true;
  isCompleted = false;
  error: string | null = null;
  safeVideoUrl: SafeResourceUrl | null = null;
  lessonNotes = '';

  private destroy$ = new Subject<void>();
  private courseId!: number;
  private lessonId!: number;
  private userId!: number;
  private enrollmentId!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private curriculumService: CurriculumService,
    private progressService: ProgressService,
    private enrollmentService: EnrollmentService,
    private authService: AuthService,
    private sanitizer: DomSanitizer,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.currentUserId || 1;

    // Get course ID from parent route (only once, as it doesn't change)
    const courseIdParam = this.route.parent?.snapshot.paramMap.get('id');
    if (courseIdParam) {
      this.courseId = parseInt(courseIdParam, 10);
    } else {
      this.error = 'Invalid course ID';
      this.isLoading = false;
      return;
    }

    // Subscribe to route parameter changes to handle lesson navigation
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const lessonIdParam = params.get('lessonId');

        if (lessonIdParam) {
          this.lessonId = parseInt(lessonIdParam, 10);
          this.loadLesson();
        } else {
          this.error = 'Invalid lesson ID';
          this.isLoading = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadLesson(): void {
    this.isLoading = true;
    this.error = null;

    // Get enrollment first
    this.enrollmentService.getEnrollment(this.userId, this.courseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (enrollment) => {
          if (enrollment) {
            this.enrollmentId = enrollment.id!;
            this.loadLessonData();
          } else {
            this.error = 'You are not enrolled in this course';
            this.isLoading = false;
          }
        },
        error: (error) => {
          console.error('Error loading enrollment:', error);
          this.error = 'Failed to verify enrollment';
          this.isLoading = false;
        }
      });
  }

  loadLessonData(): void {
    this.curriculumService.getLesson(this.lessonId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (lesson) => {
          if (lesson) {
            this.lesson = lesson;

            // Sanitize video URL if it's a video lesson
            if (lesson.type === 'video' && lesson.videoUrl) {
              this.safeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(lesson.videoUrl);
            }

            // Check if lesson is completed
            this.checkCompletion();
            this.isLoading = false;
          } else {
            this.error = 'Lesson not found';
            this.isLoading = false;
          }
        },
        error: (error) => {
          console.error('Error loading lesson:', error);
          this.error = 'Failed to load lesson';
          this.isLoading = false;
        }
      });
  }

  checkCompletion(): void {
    this.progressService.getLessonProgress(this.userId, this.lessonId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (progress) => {
          this.isCompleted = progress?.completed || false;
          this.lessonNotes = progress?.notes || '';
        },
        error: (error) => {
          console.error('Error checking completion:', error);
          this.isCompleted = false;
          this.lessonNotes = '';
        }
      });
  }

  markAsComplete(): void {
    if (this.isCompleted) return;

    this.progressService.markLessonComplete(this.userId, this.enrollmentId, this.lessonId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isCompleted = true;

          // Update enrollment progress
          this.updateEnrollmentProgress();
        },
        error: (error) => {
          console.error('Error marking lesson as complete:', error);
          alert('Failed to mark lesson as complete. Please try again.');
        }
      });
  }

  saveNotes(): void {
    this.progressService.updateLessonNotes(this.enrollmentId, this.lessonId, this.lessonNotes)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.success('Notes saved successfully! 📝');
        },
        error: (error) => {
          console.error('Error saving notes:', error);
          this.notificationService.error('Failed to save notes. Please try again.');
        }
      });
  }

  updateEnrollmentProgress(): void {
    // Get all lessons count and completed count
    this.curriculumService.getCourseSections(this.courseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (sections) => {
          const totalLessons = sections.reduce((count, section) => count + section.lessons.length, 0);

          this.progressService.getCompletedLessonIds(this.enrollmentId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (completedIds) => {
                const progress = Math.round((completedIds.length / totalLessons) * 100);
                this.enrollmentService.updateProgress(this.enrollmentId, progress).subscribe();

                // Show celebration notification if course is completed
                if (progress === 100) {
                  this.notificationService.success(`🎓 Congratulations! You've completed the entire course! 🎉`);
                }
              }
            });
        }
      });
  }

  getLessonTypeIcon(): string {
    if (!this.lesson) return 'description';

    switch (this.lesson.type) {
      case 'video':
        return 'play_circle';
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

  getLessonTypeLabel(): string {
    if (!this.lesson) return 'Lesson';

    switch (this.lesson.type) {
      case 'video':
        return 'Video Lesson';
      case 'text':
        return 'Text Lesson';
      case 'quiz':
        return 'Quiz';
      case 'assignment':
        return 'Assignment';
      default:
        return 'Lesson';
    }
  }
}
