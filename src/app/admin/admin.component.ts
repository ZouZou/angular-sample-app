import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../course/services/auth.service';
import { QuizService } from '../course/services/quiz.service';
import { CourseService } from '../course/services/course.service';
import { NotificationService } from '../shared/services/notification.service';
import { User } from '../course/models/user.interface';
import { QuizAttempt } from '../course/models/quiz.interface';
import { Course } from '../course/models/course.interface';

interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'instructor' | 'admin';
}

interface AttemptWithDetails extends QuizAttempt {
  userName?: string;
  quizTitle?: string;
  courseTitle?: string;
}

@Component({
  standalone: false,
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.sass']
})
export class AdminComponent implements OnInit {
  currentUser: User | null = null;
  selectedTab = 0;

  // User Management
  users: User[] = [];
  loadingUsers = false;
  showUserForm = false;
  editingUser: User | null = null;
  userForm: UserFormData = {
    name: '',
    email: '',
    password: '',
    role: 'student'
  };

  // Quiz Results
  quizAttempts: AttemptWithDetails[] = [];
  loadingAttempts = false;
  selectedUserId: number | null = null;
  selectedCourseId: number | null = null;

  // Courses
  courses: Course[] = [];
  loadingCourses = false;

  displayedUserColumns: string[] = ['id', 'name', 'email', 'role', 'actions'];
  displayedAttemptColumns: string[] = ['userName', 'courseTitle', 'quizTitle', 'score', 'percentage', 'passed', 'date', 'actions'];

  constructor(
    private authService: AuthService,
    private quizService: QuizService,
    private courseService: CourseService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;

    if (!this.authService.isAdmin()) {
      this.router.navigate(['/courses']);
      return;
    }

    this.loadUsers();
    this.loadCourses();
    this.loadQuizAttempts();
  }

  // User Management Methods
  loadUsers(): void {
    this.loadingUsers = true;
    this.authService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loadingUsers = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loadingUsers = false;
      }
    });
  }

  openUserForm(user?: User): void {
    this.showUserForm = true;
    if (user) {
      this.editingUser = user;
      this.userForm = {
        name: user.name,
        email: user.email,
        password: '',
        role: user.role
      };
    } else {
      this.editingUser = null;
      this.resetUserForm();
    }
  }

  closeUserForm(): void {
    this.showUserForm = false;
    this.editingUser = null;
    this.resetUserForm();
  }

  resetUserForm(): void {
    this.userForm = {
      name: '',
      email: '',
      password: '',
      role: 'student'
    };
  }

  saveUser(): void {
    if (this.editingUser) {
      // Update existing user
      const updates: any = {
        name: this.userForm.name,
        email: this.userForm.email,
        role: this.userForm.role
      };
      if (this.userForm.password) {
        updates.password = this.userForm.password;
      }

      this.authService.updateUser(this.editingUser.id, updates).subscribe({
        next: () => {
          this.notificationService.success(`User "${this.userForm.name}" updated successfully!`);
          this.loadUsers();
          this.closeUserForm();
        },
        error: (error) => {
          this.notificationService.error(error.message || 'Failed to update user');
        }
      });
    } else {
      // Create new user
      this.authService.createUser(this.userForm).subscribe({
        next: () => {
          this.notificationService.success(`User "${this.userForm.name}" created successfully!`);
          this.loadUsers();
          this.closeUserForm();
        },
        error: (error) => {
          this.notificationService.error(error.message || 'Failed to create user');
        }
      });
    }
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete user "${user.name}"?`)) {
      this.authService.deleteUser(user.id).subscribe({
        next: () => {
          this.notificationService.success(`User "${user.name}" deleted successfully`);
          this.loadUsers();
        },
        error: (error) => {
          this.notificationService.error(error.message || 'Failed to delete user');
        }
      });
    }
  }

  // Quiz Results Methods
  loadQuizAttempts(): void {
    this.loadingAttempts = true;
    this.quizService.getAllAttempts().subscribe({
      next: (attempts) => {
        this.enrichAttempts(attempts);
        this.loadingAttempts = false;
      },
      error: (error) => {
        console.error('Error loading attempts:', error);
        this.loadingAttempts = false;
      }
    });
  }

  enrichAttempts(attempts: QuizAttempt[]): void {
    this.quizAttempts = attempts.map(attempt => {
      const user = this.users.find(u => u.id === attempt.userId);
      const quiz = this.getQuizById(attempt.quizId);
      const course = quiz ? this.courses.find(c => c.id === quiz.courseId) : undefined;

      return {
        ...attempt,
        userName: user?.name || 'Unknown User',
        quizTitle: quiz?.title || 'Unknown Quiz',
        courseTitle: course?.title || 'Unknown Course'
      };
    });
  }

  getQuizById(quizId: number): any {
    // This is a helper method - in production you'd call the quiz service
    // For now, we'll return null and handle it gracefully
    return null;
  }

  filterAttemptsByUser(): void {
    if (!this.selectedUserId) {
      this.loadQuizAttempts();
      return;
    }

    this.loadingAttempts = true;
    this.quizService.getUserAllAttempts(this.selectedUserId).subscribe({
      next: (attempts) => {
        this.enrichAttempts(attempts);
        this.loadingAttempts = false;
      },
      error: (error) => {
        console.error('Error filtering attempts:', error);
        this.loadingAttempts = false;
      }
    });
  }

  filterAttemptsByCourse(): void {
    if (!this.selectedCourseId) {
      this.loadQuizAttempts();
      return;
    }

    this.loadingAttempts = true;
    this.quizService.getCourseAttempts(this.selectedCourseId).subscribe({
      next: (attempts) => {
        this.enrichAttempts(attempts);
        this.loadingAttempts = false;
      },
      error: (error) => {
        console.error('Error filtering attempts:', error);
        this.loadingAttempts = false;
      }
    });
  }

  viewAttemptDetails(attempt: QuizAttempt): void {
    this.router.navigate(['/courses', attempt.quizId, 'learn', 'quiz', attempt.quizId, 'result', attempt.id]);
  }

  // Course Management Methods
  loadCourses(): void {
    this.loadingCourses = true;
    this.courseService.getCourses().subscribe({
      next: (courses) => {
        this.courses = courses;
        this.loadingCourses = false;
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.loadingCourses = false;
      }
    });
  }

  editCourse(course: Course): void {
    this.router.navigate(['/courses', course.id, 'edit']);
  }

  createCourse(): void {
    this.router.navigate(['/courses/new']);
  }

  logout(): void {
    const userName = this.currentUser?.name || 'Admin';
    this.authService.logout();
    this.notificationService.info(`Goodbye, ${userName}! See you next time. 👋`);
    this.router.navigate(['/login']);
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'admin': return 'badge-admin';
      case 'instructor': return 'badge-instructor';
      case 'student': return 'badge-student';
      default: return '';
    }
  }
}
