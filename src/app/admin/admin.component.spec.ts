import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { AdminComponent } from './admin.component';
import { AuthService } from '../course/services/auth.service';
import { QuizService } from '../course/services/quiz.service';
import { CourseService } from '../course/services/course.service';
import { NotificationService } from '../shared/services/notification.service';

describe('AdminComponent', () => {
  let component: AdminComponent;
  let fixture: ComponentFixture<AdminComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let quizServiceSpy: jasmine.SpyObj<QuizService>;
  let courseServiceSpy: jasmine.SpyObj<CourseService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', [
      'getAllUsers', 'isAdmin', 'createUser', 'updateUser', 'deleteUser', 'logout'
    ], {
      currentUserValue: { id: 1, name: 'Admin User', email: 'admin@test.com', role: 'admin' }
    });
    const quizSpy = jasmine.createSpyObj('QuizService', ['getAllAttempts', 'getUserAllAttempts', 'getCourseAttempts']);
    const courseSpy = jasmine.createSpyObj('CourseService', ['getCourses']);
    const notificationSpy = jasmine.createSpyObj('NotificationService', ['success', 'error', 'info', 'warning']);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

    // Setup default return values
    authSpy.isAdmin.and.returnValue(true);
    authSpy.getAllUsers.and.returnValue(of([]));
    quizSpy.getAllAttempts.and.returnValue(of([]));
    courseSpy.getCourses.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      declarations: [ AdminComponent ],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: QuizService, useValue: quizSpy },
        { provide: CourseService, useValue: courseSpy },
        { provide: NotificationService, useValue: notificationSpy },
        { provide: Router, useValue: routerSpyObj }
      ]
    })
    .compileComponents();

    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    quizServiceSpy = TestBed.inject(QuizService) as jasmine.SpyObj<QuizService>;
    courseServiceSpy = TestBed.inject(CourseService) as jasmine.SpyObj<CourseService>;
    notificationServiceSpy = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
