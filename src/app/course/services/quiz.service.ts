import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { HttpService } from '../../http.service';
import { Quiz, QuizQuestion, QuizAttempt, UserAnswer } from '../models/quiz.interface';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private apiUrl = '/api';

  // Mock quiz data for Angular course
  private mockQuizzes: Quiz[] = [
    {
      id: 1,
      courseId: 1,
      lessonId: 4,
      title: 'Getting Started Quiz',
      description: 'Test your understanding of Angular basics',
      passingScore: 70,
      timeLimit: 10,
      questions: [
        {
          id: 1,
          quizId: 1,
          question: 'What is Angular?',
          type: 'multiple-choice',
          order: 1,
          points: 10,
          explanation: 'Angular is a TypeScript-based open-source web application framework led by the Angular Team at Google.',
          options: [
            { id: 1, questionId: 1, text: 'A JavaScript library for building user interfaces', isCorrect: false, order: 1 },
            { id: 2, questionId: 1, text: 'A TypeScript-based framework for building web applications', isCorrect: true, order: 2 },
            { id: 3, questionId: 1, text: 'A CSS framework', isCorrect: false, order: 3 },
            { id: 4, questionId: 1, text: 'A database management system', isCorrect: false, order: 4 }
          ]
        },
        {
          id: 2,
          quizId: 1,
          question: 'Which command is used to create a new Angular project?',
          type: 'multiple-choice',
          order: 2,
          points: 10,
          explanation: 'The Angular CLI command "ng new" is used to create a new Angular project with all necessary files and dependencies.',
          options: [
            { id: 5, questionId: 2, text: 'npm create angular-app', isCorrect: false, order: 1 },
            { id: 6, questionId: 2, text: 'ng new project-name', isCorrect: true, order: 2 },
            { id: 7, questionId: 2, text: 'angular create project', isCorrect: false, order: 3 },
            { id: 8, questionId: 2, text: 'npm init angular', isCorrect: false, order: 4 }
          ]
        },
        {
          id: 3,
          quizId: 1,
          question: 'Angular applications are written primarily in TypeScript.',
          type: 'true-false',
          order: 3,
          points: 10,
          explanation: 'Yes, Angular applications are primarily written in TypeScript, which provides static typing and better tooling support.',
          options: [
            { id: 9, questionId: 3, text: 'True', isCorrect: true, order: 1 },
            { id: 10, questionId: 3, text: 'False', isCorrect: false, order: 2 }
          ]
        },
        {
          id: 4,
          quizId: 1,
          question: 'What does CLI stand for in Angular CLI?',
          type: 'multiple-choice',
          order: 4,
          points: 10,
          explanation: 'CLI stands for Command Line Interface, which is a tool to initialize, develop, scaffold, and maintain Angular applications.',
          options: [
            { id: 11, questionId: 4, text: 'Central Learning Interface', isCorrect: false, order: 1 },
            { id: 12, questionId: 4, text: 'Command Line Interface', isCorrect: true, order: 2 },
            { id: 13, questionId: 4, text: 'Component Library Interface', isCorrect: false, order: 3 },
            { id: 14, questionId: 4, text: 'Code Loading Interface', isCorrect: false, order: 4 }
          ]
        },
        {
          id: 5,
          quizId: 1,
          question: 'Which of the following are core concepts in Angular? (Select all that apply)',
          type: 'multi-select',
          order: 5,
          points: 10,
          explanation: 'Components, Services, and Modules are all core concepts in Angular architecture.',
          options: [
            { id: 15, questionId: 5, text: 'Components', isCorrect: true, order: 1 },
            { id: 16, questionId: 5, text: 'Services', isCorrect: true, order: 2 },
            { id: 17, questionId: 5, text: 'Modules', isCorrect: true, order: 3 },
            { id: 18, questionId: 5, text: 'Fragments', isCorrect: false, order: 4 }
          ]
        }
      ]
    },
    {
      id: 2,
      courseId: 1,
      lessonId: 9,
      title: 'Components Quiz',
      description: 'Test your knowledge of Angular components',
      passingScore: 70,
      timeLimit: 15,
      questions: [
        {
          id: 6,
          quizId: 2,
          question: 'What decorator is used to define an Angular component?',
          type: 'multiple-choice',
          order: 1,
          points: 10,
          explanation: '@Component is the decorator used to define metadata for Angular components.',
          options: [
            { id: 19, questionId: 6, text: '@Component', isCorrect: true, order: 1 },
            { id: 20, questionId: 6, text: '@Directive', isCorrect: false, order: 2 },
            { id: 21, questionId: 6, text: '@Module', isCorrect: false, order: 3 },
            { id: 22, questionId: 6, text: '@Injectable', isCorrect: false, order: 4 }
          ]
        },
        {
          id: 7,
          quizId: 2,
          question: 'Which lifecycle hook is called after Angular initializes the component?',
          type: 'multiple-choice',
          order: 2,
          points: 10,
          explanation: 'ngOnInit() is called once after the component is initialized and its inputs are set.',
          options: [
            { id: 23, questionId: 7, text: 'ngOnInit', isCorrect: true, order: 1 },
            { id: 24, questionId: 7, text: 'ngOnStart', isCorrect: false, order: 2 },
            { id: 25, questionId: 7, text: 'ngAfterInit', isCorrect: false, order: 3 },
            { id: 26, questionId: 7, text: 'ngBegin', isCorrect: false, order: 4 }
          ]
        },
        {
          id: 8,
          quizId: 2,
          question: 'What is the correct syntax for property binding in Angular?',
          type: 'multiple-choice',
          order: 3,
          points: 10,
          explanation: 'Property binding uses square brackets [property]="value" to bind a component property to a DOM property.',
          options: [
            { id: 27, questionId: 8, text: '{{property}}', isCorrect: false, order: 1 },
            { id: 28, questionId: 8, text: '[property]="value"', isCorrect: true, order: 2 },
            { id: 29, questionId: 8, text: '(property)="value"', isCorrect: false, order: 3 },
            { id: 30, questionId: 8, text: '[(property)]="value"', isCorrect: false, order: 4 }
          ]
        },
        {
          id: 9,
          quizId: 2,
          question: 'Event binding in Angular uses parentheses ().',
          type: 'true-false',
          order: 4,
          points: 10,
          explanation: 'True. Event binding uses parentheses, for example: (click)="handleClick()"',
          options: [
            { id: 31, questionId: 9, text: 'True', isCorrect: true, order: 1 },
            { id: 32, questionId: 9, text: 'False', isCorrect: false, order: 2 }
          ]
        },
        {
          id: 10,
          quizId: 2,
          question: 'Which of the following are valid data binding types in Angular?',
          type: 'multi-select',
          order: 5,
          points: 10,
          explanation: 'Angular supports interpolation {{}}, property binding [], event binding (), and two-way binding [()].',
          options: [
            { id: 33, questionId: 10, text: 'Interpolation', isCorrect: true, order: 1 },
            { id: 34, questionId: 10, text: 'Property Binding', isCorrect: true, order: 2 },
            { id: 35, questionId: 10, text: 'Event Binding', isCorrect: true, order: 3 },
            { id: 36, questionId: 10, text: 'Style Binding', isCorrect: false, order: 4 }
          ]
        }
      ]
    },
    {
      id: 3,
      courseId: 1,
      lessonId: 13,
      title: 'Services and Dependency Injection Quiz',
      description: 'Test your understanding of services and DI',
      passingScore: 70,
      timeLimit: 12,
      questions: [
        {
          id: 11,
          quizId: 3,
          question: 'What decorator is used to make a class injectable as a service?',
          type: 'multiple-choice',
          order: 1,
          points: 10,
          explanation: '@Injectable decorator marks a class as available for dependency injection.',
          options: [
            { id: 37, questionId: 11, text: '@Service', isCorrect: false, order: 1 },
            { id: 38, questionId: 11, text: '@Injectable', isCorrect: true, order: 2 },
            { id: 39, questionId: 11, text: '@Inject', isCorrect: false, order: 3 },
            { id: 40, questionId: 11, text: '@Provider', isCorrect: false, order: 4 }
          ]
        },
        {
          id: 12,
          quizId: 3,
          question: 'Services in Angular are singleton by default when provided in root.',
          type: 'true-false',
          order: 2,
          points: 10,
          explanation: 'True. Services provided in root using providedIn: "root" are singletons shared across the entire application.',
          options: [
            { id: 41, questionId: 12, text: 'True', isCorrect: true, order: 1 },
            { id: 42, questionId: 12, text: 'False', isCorrect: false, order: 2 }
          ]
        },
        {
          id: 13,
          quizId: 3,
          question: 'What is the purpose of dependency injection in Angular?',
          type: 'multiple-choice',
          order: 3,
          points: 10,
          explanation: 'Dependency injection provides instances of classes that other classes depend on, promoting loose coupling and testability.',
          options: [
            { id: 43, questionId: 13, text: 'To inject HTML into components', isCorrect: false, order: 1 },
            { id: 44, questionId: 13, text: 'To provide instances of classes to other classes', isCorrect: true, order: 2 },
            { id: 45, questionId: 13, text: 'To load external scripts', isCorrect: false, order: 3 },
            { id: 46, questionId: 13, text: 'To manage routing', isCorrect: false, order: 4 }
          ]
        }
      ]
    },
    {
      id: 4,
      courseId: 1,
      lessonId: 20,
      title: 'Forms Quiz',
      description: 'Test your knowledge of Angular forms',
      passingScore: 70,
      timeLimit: 15,
      questions: [
        {
          id: 14,
          quizId: 4,
          question: 'Which module is required for reactive forms?',
          type: 'multiple-choice',
          order: 1,
          points: 10,
          explanation: 'ReactiveFormsModule is required to use reactive forms in Angular.',
          options: [
            { id: 47, questionId: 14, text: 'FormsModule', isCorrect: false, order: 1 },
            { id: 48, questionId: 14, text: 'ReactiveFormsModule', isCorrect: true, order: 2 },
            { id: 49, questionId: 14, text: 'FormBuilderModule', isCorrect: false, order: 3 },
            { id: 50, questionId: 14, text: 'NgFormsModule', isCorrect: false, order: 4 }
          ]
        },
        {
          id: 15,
          quizId: 4,
          question: 'Template-driven forms use [(ngModel)] for two-way data binding.',
          type: 'true-false',
          order: 2,
          points: 10,
          explanation: 'True. Template-driven forms use [(ngModel)] directive for two-way data binding.',
          options: [
            { id: 51, questionId: 15, text: 'True', isCorrect: true, order: 1 },
            { id: 52, questionId: 15, text: 'False', isCorrect: false, order: 2 }
          ]
        },
        {
          id: 16,
          quizId: 4,
          question: 'Which class is used to create a form control in reactive forms?',
          type: 'multiple-choice',
          order: 3,
          points: 10,
          explanation: 'FormControl class is used to track the value and validation status of an individual form control.',
          options: [
            { id: 53, questionId: 16, text: 'FormControl', isCorrect: true, order: 1 },
            { id: 54, questionId: 16, text: 'FormField', isCorrect: false, order: 2 },
            { id: 55, questionId: 16, text: 'Control', isCorrect: false, order: 3 },
            { id: 56, questionId: 16, text: 'InputControl', isCorrect: false, order: 4 }
          ]
        }
      ]
    }
  ];

  private mockAttempts: QuizAttempt[] = [];
  private attemptIdCounter = 1;

  constructor(private http: HttpService) { }

  /**
   * Get a quiz by ID
   */
  getQuiz(id: number): Observable<Quiz> {
    // Uncomment for real API:
    // return this.http.getRequest(`${this.apiUrl}/quizzes/${id}`);

    const quiz = this.mockQuizzes.find(q => q.id === id);
    if (quiz) {
      return of(quiz).pipe(delay(300));
    }
    throw new Error(`Quiz with ID ${id} not found`);
  }

  /**
   * Get all quizzes for a course
   */
  getCourseQuizzes(courseId: number): Observable<Quiz[]> {
    // Uncomment for real API:
    // return this.http.getRequest(`${this.apiUrl}/courses/${courseId}/quizzes`);

    const quizzes = this.mockQuizzes.filter(q => q.courseId === courseId);
    return of(quizzes).pipe(delay(300));
  }

  /**
   * Start a new quiz attempt
   */
  startQuizAttempt(userId: number, enrollmentId: number, quizId: number): Observable<QuizAttempt> {
    // Uncomment for real API:
    // return this.http.postRequest(`${this.apiUrl}/quiz-attempts`, { userId, enrollmentId, quizId });

    const quiz = this.mockQuizzes.find(q => q.id === quizId);
    if (!quiz) {
      throw new Error(`Quiz with ID ${quizId} not found`);
    }

    const userAttempts = this.mockAttempts.filter(a => a.userId === userId && a.quizId === quizId);
    const attemptNumber = userAttempts.length + 1;

    const newAttempt: QuizAttempt = {
      id: this.attemptIdCounter++,
      userId,
      enrollmentId,
      quizId,
      attemptNumber,
      score: 0,
      totalPoints: quiz.questions.reduce((sum, q) => sum + q.points, 0),
      percentage: 0,
      passed: false,
      startedAt: new Date(),
      answers: []
    };

    this.mockAttempts.push(newAttempt);
    return of(newAttempt).pipe(delay(200));
  }

  /**
   * Submit quiz attempt with answers
   */
  submitQuizAttempt(attemptId: number, answers: UserAnswer[]): Observable<QuizAttempt> {
    // Uncomment for real API:
    // return this.http.putRequest(`${this.apiUrl}/quiz-attempts/${attemptId}`, { answers });

    const attempt = this.mockAttempts.find(a => a.id === attemptId);
    if (!attempt) {
      throw new Error(`Attempt with ID ${attemptId} not found`);
    }

    const quiz = this.mockQuizzes.find(q => q.id === attempt.quizId);
    if (!quiz) {
      throw new Error(`Quiz not found`);
    }

    // Grade the quiz
    let totalScore = 0;
    const gradedAnswers: UserAnswer[] = [];

    answers.forEach(answer => {
      const question = quiz.questions.find(q => q.id === answer.questionId);
      if (question) {
        const correctOptionIds = question.options
          .filter(o => o.isCorrect)
          .map(o => o.id!);

        let isCorrect = false;
        let pointsEarned = 0;

        if (question.type === 'multi-select') {
          // For multi-select, must select all correct options and no incorrect ones
          const selectedCorrect = answer.selectedOptionIds.every(id => correctOptionIds.includes(id));
          const allCorrectSelected = correctOptionIds.every(id => answer.selectedOptionIds.includes(id));
          isCorrect = selectedCorrect && allCorrectSelected && answer.selectedOptionIds.length === correctOptionIds.length;
        } else {
          // For single choice and true-false
          isCorrect = answer.selectedOptionIds.length === 1 && correctOptionIds.includes(answer.selectedOptionIds[0]);
        }

        pointsEarned = isCorrect ? question.points : 0;
        totalScore += pointsEarned;

        gradedAnswers.push({
          ...answer,
          isCorrect,
          pointsEarned
        });
      }
    });

    const percentage = (totalScore / attempt.totalPoints) * 100;
    const passed = percentage >= quiz.passingScore;

    attempt.score = totalScore;
    attempt.percentage = Math.round(percentage * 100) / 100; // Round to 2 decimals
    attempt.passed = passed;
    attempt.completedAt = new Date();
    attempt.answers = gradedAnswers;

    return of(attempt).pipe(delay(500));
  }

  /**
   * Get all attempts for a user on a specific quiz
   */
  getUserQuizAttempts(userId: number, quizId: number): Observable<QuizAttempt[]> {
    // Uncomment for real API:
    // return this.http.getRequest(`${this.apiUrl}/quiz-attempts/user/${userId}/quiz/${quizId}`);

    const attempts = this.mockAttempts.filter(a => a.userId === userId && a.quizId === quizId);
    return of(attempts).pipe(delay(200));
  }

  /**
   * Get best attempt for a user on a quiz
   */
  getBestAttempt(userId: number, quizId: number): Observable<QuizAttempt | null> {
    const attempts = this.mockAttempts.filter(
      a => a.userId === userId && a.quizId === quizId && a.completedAt
    );

    if (attempts.length === 0) {
      return of(null).pipe(delay(200));
    }

    const bestAttempt = attempts.reduce((best, current) =>
      current.percentage > best.percentage ? current : best
    );

    return of(bestAttempt).pipe(delay(200));
  }

  /**
   * Get attempt by ID
   */
  getAttempt(attemptId: number): Observable<QuizAttempt | null> {
    const attempt = this.mockAttempts.find(a => a.id === attemptId);
    return of(attempt || null).pipe(delay(200));
  }

  /**
   * Create a new quiz (for instructors)
   */
  createQuiz(quiz: Quiz): Observable<Quiz> {
    const newQuiz: Quiz = {
      ...quiz,
      id: Math.max(...this.mockQuizzes.map(q => q.id || 0)) + 1
    };
    this.mockQuizzes.push(newQuiz);
    return of(newQuiz).pipe(delay(300));
  }

  /**
   * Update a quiz
   */
  updateQuiz(id: number, quiz: Quiz): Observable<Quiz> {
    const index = this.mockQuizzes.findIndex(q => q.id === id);
    if (index !== -1) {
      this.mockQuizzes[index] = { ...quiz, id };
      return of(this.mockQuizzes[index]).pipe(delay(300));
    }
    throw new Error(`Quiz with ID ${id} not found`);
  }

  /**
   * Delete a quiz
   */
  deleteQuiz(id: number): Observable<void> {
    const index = this.mockQuizzes.findIndex(q => q.id === id);
    if (index !== -1) {
      this.mockQuizzes.splice(index, 1);
      // Also remove associated attempts
      const attemptIndexes = this.mockAttempts
        .map((a, i) => a.quizId === id ? i : -1)
        .filter(i => i !== -1)
        .reverse();
      attemptIndexes.forEach(i => this.mockAttempts.splice(i, 1));
      return of(void 0).pipe(delay(200));
    }
    throw new Error(`Quiz with ID ${id} not found`);
  }

  /**
   * Get all quiz attempts (admin only)
   */
  getAllAttempts(): Observable<QuizAttempt[]> {
    return of([...this.mockAttempts]).pipe(delay(300));
  }

  /**
   * Get all attempts for a specific course (admin only)
   */
  getCourseAttempts(courseId: number): Observable<QuizAttempt[]> {
    const courseQuizIds = this.mockQuizzes
      .filter(q => q.courseId === courseId)
      .map(q => q.id);

    const attempts = this.mockAttempts.filter(a => courseQuizIds.includes(a.quizId));
    return of(attempts).pipe(delay(300));
  }

  /**
   * Get all attempts for a specific user across all quizzes (admin only)
   */
  getUserAllAttempts(userId: number): Observable<QuizAttempt[]> {
    const attempts = this.mockAttempts.filter(a => a.userId === userId);
    return of(attempts).pipe(delay(300));
  }
}
