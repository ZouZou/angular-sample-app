import 'reflect-metadata';
import dotenv from 'dotenv';
import { AppDataSource } from '../config/database';
import { Course } from '../entities/Course';
import { CourseSection } from '../entities/CourseSection';
import { Lesson } from '../entities/Lesson';
import { Quiz } from '../entities/Quiz';
import { QuizQuestion } from '../entities/QuizQuestion';
import { QuizOption } from '../entities/QuizOption';
import { User } from '../entities/User';
import bcrypt from 'bcrypt';

dotenv.config();

const seedData = async () => {
  try {
    console.log('Connecting to database...');
    await AppDataSource.initialize();
    console.log('Database connected successfully');

    // Clear existing data (in correct order for foreign key constraints)
    console.log('Clearing existing data...');
    await AppDataSource.query('TRUNCATE TABLE quiz_options, quiz_questions, quizzes, lessons, course_sections, courses, users, user_progress, quiz_attempts, user_answers, enrollments RESTART IDENTITY CASCADE');
    console.log('Existing data cleared');

    // Create sample users
    console.log('Creating sample users...');
    const userRepo = AppDataSource.getRepository(User);

    const adminUser = userRepo.create({
      name: 'Admin User',
      email: 'admin@lms.com',
      passwordHash: await bcrypt.hash('admin123', 10),
      role: 'admin'
    });
    await userRepo.save(adminUser);

    const studentUser = userRepo.create({
      name: 'John Student',
      email: 'john@lms.com',
      passwordHash: await bcrypt.hash('student123', 10),
      role: 'student'
    });
    await userRepo.save(studentUser);

    const instructorUser = userRepo.create({
      name: 'Jane Instructor',
      email: 'jane@lms.com',
      passwordHash: await bcrypt.hash('instructor123', 10),
      role: 'instructor'
    });
    await userRepo.save(instructorUser);

    const studentUser2 = userRepo.create({
      name: 'Alice Student',
      email: 'alice@lms.com',
      passwordHash: await bcrypt.hash('student123', 10),
      role: 'student'
    });
    await userRepo.save(studentUser2);

    console.log('Users created successfully');

    // Create courses
    console.log('Creating courses...');
    const courseRepo = AppDataSource.getRepository(Course);
    const sectionRepo = AppDataSource.getRepository(CourseSection);
    const lessonRepo = AppDataSource.getRepository(Lesson);
    const quizRepo = AppDataSource.getRepository(Quiz);
    const questionRepo = AppDataSource.getRepository(QuizQuestion);
    const optionRepo = AppDataSource.getRepository(QuizOption);

    // Course 1: Angular Complete Guide - COMPREHENSIVE VERSION
    console.log('Creating comprehensive Angular course...');
    const angularCourse = courseRepo.create({
      title: 'Angular - The Complete Guide (2025 Edition)',
      description: 'Master Angular 20 from the ground up and build awesome, reactive web apps with the successor of Angular.js. Learn all the fundamentals about Components, Directives, Services, Pipes, HTTP access, Authentication, Routing, Modules, NgRx, and much more in this bestselling Angular course! This comprehensive course covers everything from basics to advanced topics with 15 sections, 120+ lessons, and hands-on quizzes.',
      instructor: 'Maximilian Schwarzmüller',
      duration: 3540,
      price: 84.99,
      category: 'Web Development',
      level: 'Beginner',
      thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop',
      bannerUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&h=400&fit=crop',
      enrollmentCount: 1247,
      rating: 4.7,
      language: 'English',
      requirements: [
        'Basic knowledge of HTML, CSS, and JavaScript is required',
        'No Angular or TypeScript knowledge is required!',
        'A modern code editor (VS Code recommended)',
        'Node.js and npm installed on your machine'
      ],
      learningOutcomes: [
        'Develop modern, complex, responsive and scalable web applications with Angular',
        'Use the gained, deep understanding of the Angular fundamentals to quickly establish yourself as a frontend developer',
        'Fully understand the architecture of an Angular application and how to use it',
        'Create single-page applications with one of the most modern JavaScript frameworks',
        'Use TypeScript to write more robust code and leverage its advantages',
        'Learn about Components, Directives, Services, Pipes, HTTP access, Authentication, Modules, and much more'
      ],
      published: true
    });
    await courseRepo.save(angularCourse);

    console.log('Creating sections and lessons...');
    // We'll create a comprehensive course structure
    // For brevity in actual seed script, I'll create a representative set

    // This script will be run separately with npm run seed:comprehensive
    console.log('Creating Section 1: Getting Started...');
    const section1 = sectionRepo.create({
      courseId: angularCourse.id,
      title: 'Getting Started',
      order: 1,
      description: 'Learn what Angular is, set up your development environment, and create your first Angular application'
    });
    await sectionRepo.save(section1);

    await lessonRepo.save([
      lessonRepo.create({ sectionId: section1.id, title: 'Welcome to the Course!', content: 'Introduction to the course structure and what you will learn throughout this comprehensive Angular journey.', type: 'video', duration: 5, order: 1, videoUrl: 'https://example.com/videos/angular/welcome.mp4' }),
      lessonRepo.create({ sectionId: section1.id, title: 'What is Angular?', content: 'Understanding Angular framework, its history, and why it\'s one of the most popular frameworks for building web applications.', type: 'video', duration: 12, order: 2, videoUrl: 'https://example.com/videos/angular/what-is-angular.mp4' }),
      lessonRepo.create({ sectionId: section1.id, title: 'Angular vs React vs Vue', content: 'A comparison of the major JavaScript frameworks to help you understand Angular\'s strengths and when to use it.', type: 'video', duration: 10, order: 3, videoUrl: 'https://example.com/videos/angular/framework-comparison.mp4' }),
      lessonRepo.create({ sectionId: section1.id, title: 'Setting Up Development Environment', content: 'Step-by-step guide to install Node.js, npm, and Angular CLI. Configure VS Code with essential extensions for Angular development.', type: 'video', duration: 15, order: 4, videoUrl: 'https://example.com/videos/angular/setup-environment.mp4' }),
      lessonRepo.create({ sectionId: section1.id, title: 'Creating Your First Angular App', content: 'Use Angular CLI to create a new project, understand the project structure, and run your first Angular application.', type: 'video', duration: 20, order: 5, videoUrl: 'https://example.com/videos/angular/first-app.mp4' }),
      lessonRepo.create({ sectionId: section1.id, title: 'Understanding the Project Structure', content: 'Deep dive into the files and folders created by Angular CLI. Learn what each file does and how they work together.', type: 'video', duration: 18, order: 6, videoUrl: 'https://example.com/videos/angular/project-structure.mp4' })
    ]);

    console.log('Creating Section 2: TypeScript Fundamentals...');
    const section2 = sectionRepo.create({ courseId: angularCourse.id, title: 'TypeScript Fundamentals', order: 2, description: 'Master TypeScript - the programming language used in Angular applications' });
    await sectionRepo.save(section2);

    await lessonRepo.save([
      lessonRepo.create({ sectionId: section2.id, title: 'Introduction to TypeScript', content: 'Understanding TypeScript and why Angular uses it. Learn about static typing and its benefits.', type: 'video', duration: 15, order: 1, videoUrl: 'https://example.com/videos/angular/typescript-intro.mp4' }),
      lessonRepo.create({ sectionId: section2.id, title: 'Types and Variables', content: 'Learn about primitive types, arrays, tuples, and enums in TypeScript.', type: 'video', duration: 22, order: 2, videoUrl: 'https://example.com/videos/angular/typescript-types.mp4' }),
      lessonRepo.create({ sectionId: section2.id, title: 'Functions and Interfaces', content: 'Master function declarations, arrow functions, and interface definitions in TypeScript.', type: 'video', duration: 25, order: 3, videoUrl: 'https://example.com/videos/angular/typescript-functions.mp4' }),
      lessonRepo.create({ sectionId: section2.id, title: 'Classes and Object-Oriented Programming', content: 'Deep dive into classes, inheritance, access modifiers, and OOP concepts in TypeScript.', type: 'video', duration: 30, order: 4, videoUrl: 'https://example.com/videos/angular/typescript-classes.mp4' }),
      lessonRepo.create({ sectionId: section2.id, title: 'Generics and Advanced Types', content: 'Learn about generic types, union types, intersection types, and type guards.', type: 'video', duration: 28, order: 5, videoUrl: 'https://example.com/videos/angular/typescript-advanced.mp4' })
    ]);

    // Quiz 1
    const quiz1 = quizRepo.create({ courseId: angularCourse.id, title: 'TypeScript Fundamentals Quiz', description: 'Test your understanding of TypeScript basics', passingScore: 70, timeLimit: 20 });
    await quizRepo.save(quiz1);

    const tsQ1 = questionRepo.create({ quizId: quiz1.id, question: 'Which of the following is NOT a primitive type in TypeScript?', type: 'multiple-choice', points: 10, order: 1 });
    await questionRepo.save(tsQ1);
    await optionRepo.save([
      optionRepo.create({ questionId: tsQ1.id, text: 'string', order: 1, isCorrect: false }),
      optionRepo.create({ questionId: tsQ1.id, text: 'number', order: 2, isCorrect: false }),
      optionRepo.create({ questionId: tsQ1.id, text: 'array', order: 3, isCorrect: true }),
      optionRepo.create({ questionId: tsQ1.id, text: 'boolean', order: 4, isCorrect: false })
    ]);

    const tsQ2 = questionRepo.create({ quizId: quiz1.id, question: 'What is the purpose of interfaces in TypeScript?', type: 'multiple-choice', points: 10, order: 2 });
    await questionRepo.save(tsQ2);
    await optionRepo.save([
      optionRepo.create({ questionId: tsQ2.id, text: 'To define the structure of an object', order: 1, isCorrect: true }),
      optionRepo.create({ questionId: tsQ2.id, text: 'To create instances of classes', order: 2, isCorrect: false }),
      optionRepo.create({ questionId: tsQ2.id, text: 'To import modules', order: 3, isCorrect: false }),
      optionRepo.create({ questionId: tsQ2.id, text: 'To handle errors', order: 4, isCorrect: false })
    ]);

    console.log('Creating Section 3: Components & Templates...');
    const section3 = sectionRepo.create({ courseId: angularCourse.id, title: 'Components & Templates', order: 3, description: 'Master Angular components - the building blocks of Angular applications' });
    await sectionRepo.save(section3);

    await lessonRepo.save([
      lessonRepo.create({ sectionId: section3.id, title: 'What are Components?', content: 'Understanding components as the fundamental building blocks of Angular applications.', type: 'video', duration: 18, order: 1, videoUrl: 'https://example.com/videos/angular/what-are-components.mp4' }),
      lessonRepo.create({ sectionId: section3.id, title: 'Creating Components', content: 'Learn multiple ways to create components using Angular CLI and manually.', type: 'video', duration: 22, order: 2, videoUrl: 'https://example.com/videos/angular/creating-components.mp4' }),
      lessonRepo.create({ sectionId: section3.id, title: 'Component Templates & Styles', content: 'Working with inline and external templates, adding styles, and understanding view encapsulation.', type: 'video', duration: 25, order: 3, videoUrl: 'https://example.com/videos/angular/templates-styles.mp4' }),
      lessonRepo.create({ sectionId: section3.id, title: 'Data Binding - Interpolation', content: 'Learn string interpolation to display dynamic data in your templates.', type: 'video', duration: 20, order: 4, videoUrl: 'https://example.com/videos/angular/interpolation.mp4' }),
      lessonRepo.create({ sectionId: section3.id, title: 'Property Binding', content: 'Master property binding to bind component properties to DOM element properties.', type: 'video', duration: 23, order: 5, videoUrl: 'https://example.com/videos/angular/property-binding.mp4' }),
      lessonRepo.create({ sectionId: section3.id, title: 'Event Binding', content: 'Handle user events like clicks, input changes, and more with event binding.', type: 'video', duration: 25, order: 6, videoUrl: 'https://example.com/videos/angular/event-binding.mp4' }),
      lessonRepo.create({ sectionId: section3.id, title: 'Two-Way Data Binding', content: 'Implement two-way data binding using ngModel for forms and user input.', type: 'video', duration: 20, order: 7, videoUrl: 'https://example.com/videos/angular/two-way-binding.mp4' }),
      lessonRepo.create({ sectionId: section3.id, title: 'Component Communication - @Input', content: 'Pass data from parent to child components using the @Input decorator.', type: 'video', duration: 28, order: 8, videoUrl: 'https://example.com/videos/angular/input-decorator.mp4' }),
      lessonRepo.create({ sectionId: section3.id, title: 'Component Communication - @Output', content: 'Emit events from child to parent components using @Output and EventEmitter.', type: 'video', duration: 30, order: 9, videoUrl: 'https://example.com/videos/angular/output-decorator.mp4' }),
      lessonRepo.create({ sectionId: section3.id, title: 'Component Lifecycle Hooks', content: 'Master Angular lifecycle hooks: ngOnInit, ngOnChanges, ngOnDestroy, and more.', type: 'video', duration: 35, order: 10, videoUrl: 'https://example.com/videos/angular/lifecycle-hooks.mp4' })
    ]);

    console.log('Creating Section 4: Directives...');
    const section4 = sectionRepo.create({ courseId: angularCourse.id, title: 'Directives Deep Dive', order: 4, description: 'Learn about structural and attribute directives to manipulate the DOM' });
    await sectionRepo.save(section4);

    await lessonRepo.save([
      lessonRepo.create({ sectionId: section4.id, title: 'Understanding Directives', content: 'Introduction to directives and their role in Angular.', type: 'video', duration: 15, order: 1, videoUrl: 'https://example.com/videos/angular/understanding-directives.mp4' }),
      lessonRepo.create({ sectionId: section4.id, title: '*ngIf - Conditional Rendering', content: 'Show or hide elements based on conditions using the *ngIf directive.', type: 'video', duration: 20, order: 2, videoUrl: 'https://example.com/videos/angular/ngif.mp4' }),
      lessonRepo.create({ sectionId: section4.id, title: '*ngFor - Rendering Lists', content: 'Loop through arrays and render lists dynamically with *ngFor directive.', type: 'video', duration: 25, order: 3, videoUrl: 'https://example.com/videos/angular/ngfor.mp4' }),
      lessonRepo.create({ sectionId: section4.id, title: 'ngSwitch - Multiple Conditions', content: 'Handle multiple conditions elegantly with ngSwitch directive.', type: 'video', duration: 18, order: 4, videoUrl: 'https://example.com/videos/angular/ngswitch.mp4' }),
      lessonRepo.create({ sectionId: section4.id, title: 'ngClass and ngStyle', content: 'Dynamically add CSS classes and inline styles using ngClass and ngStyle.', type: 'video', duration: 22, order: 5, videoUrl: 'https://example.com/videos/angular/ngclass-ngstyle.mp4' }),
      lessonRepo.create({ sectionId: section4.id, title: 'Creating Custom Attribute Directives', content: 'Build your own custom attribute directives to extend HTML functionality.', type: 'video', duration: 30, order: 6, videoUrl: 'https://example.com/videos/angular/custom-attribute-directive.mp4' }),
      lessonRepo.create({ sectionId: section4.id, title: 'Creating Custom Structural Directives', content: 'Advanced: Create custom structural directives to manipulate the DOM.', type: 'video', duration: 35, order: 7, videoUrl: 'https://example.com/videos/angular/custom-structural-directive.mp4' })
    ]);

    // Quiz 2
    const quiz2 = quizRepo.create({ courseId: angularCourse.id, title: 'Components and Directives Quiz', description: 'Test your knowledge of Angular components and directives', passingScore: 75, timeLimit: 25 });
    await quizRepo.save(quiz2);

    const cdQ1 = questionRepo.create({ quizId: quiz2.id, question: 'Which decorator is used to pass data from parent to child component?', type: 'multiple-choice', points: 10, order: 1 });
    await questionRepo.save(cdQ1);
    await optionRepo.save([
      optionRepo.create({ questionId: cdQ1.id, text: '@Output()', order: 1, isCorrect: false }),
      optionRepo.create({ questionId: cdQ1.id, text: '@Input()', order: 2, isCorrect: true }),
      optionRepo.create({ questionId: cdQ1.id, text: '@ViewChild()', order: 3, isCorrect: false }),
      optionRepo.create({ questionId: cdQ1.id, text: '@Injectable()', order: 4, isCorrect: false })
    ]);

    const cdQ2 = questionRepo.create({ quizId: quiz2.id, question: 'Which directive would you use to loop through an array in the template?', type: 'multiple-choice', points: 10, order: 2 });
    await questionRepo.save(cdQ2);
    await optionRepo.save([
      optionRepo.create({ questionId: cdQ2.id, text: '*ngIf', order: 1, isCorrect: false }),
      optionRepo.create({ questionId: cdQ2.id, text: '*ngFor', order: 2, isCorrect: true }),
      optionRepo.create({ questionId: cdQ2.id, text: 'ngModel', order: 3, isCorrect: false }),
      optionRepo.create({ questionId: cdQ2.id, text: 'ngSwitch', order: 4, isCorrect: false })
    ]);

    console.log('Creating Section 5: Services & Dependency Injection...');
    const section5 = sectionRepo.create({ courseId: angularCourse.id, title: 'Services & Dependency Injection', order: 5, description: 'Learn how to create services and use dependency injection to share data and functionality' });
    await sectionRepo.save(section5);

    await lessonRepo.save([
      lessonRepo.create({ sectionId: section5.id, title: 'Why Services?', content: 'Understanding the need for services in Angular applications for code reusability and separation of concerns.', type: 'video', duration: 15, order: 1, videoUrl: 'https://example.com/videos/angular/why-services.mp4' }),
      lessonRepo.create({ sectionId: section5.id, title: 'Creating and Using Services', content: 'Create your first service and inject it into components using Angular CLI.', type: 'video', duration: 25, order: 2, videoUrl: 'https://example.com/videos/angular/creating-services.mp4' }),
      lessonRepo.create({ sectionId: section5.id, title: 'Understanding Dependency Injection', content: 'Deep dive into Angular\'s dependency injection system and hierarchical injectors.', type: 'video', duration: 30, order: 3, videoUrl: 'https://example.com/videos/angular/dependency-injection.mp4' }),
      lessonRepo.create({ sectionId: section5.id, title: 'Service Providers and Scopes', content: 'Learn about providedIn, root scope, and module-level service providers.', type: 'video', duration: 28, order: 4, videoUrl: 'https://example.com/videos/angular/service-providers.mp4' }),
      lessonRepo.create({ sectionId: section5.id, title: 'Cross-Component Communication with Services', content: 'Use services with EventEmitter or Subject to communicate between unrelated components.', type: 'video', duration: 32, order: 5, videoUrl: 'https://example.com/videos/angular/service-communication.mp4' })
    ]);

    console.log('Creating Section 6: Routing & Navigation...');
    const section6 = sectionRepo.create({ courseId: angularCourse.id, title: 'Routing & Navigation', order: 6, description: 'Build single-page applications with Angular Router' });
    await sectionRepo.save(section6);

    await lessonRepo.save([
      lessonRepo.create({ sectionId: section6.id, title: 'Introduction to Routing', content: 'Understanding Single Page Applications and the role of routing in Angular.', type: 'video', duration: 15, order: 1, videoUrl: 'https://example.com/videos/angular/routing-intro.mp4' }),
      lessonRepo.create({ sectionId: section6.id, title: 'Setting Up Routes', content: 'Configure routes in your Angular application using RouterModule.', type: 'video', duration: 25, order: 2, videoUrl: 'https://example.com/videos/angular/setup-routes.mp4' }),
      lessonRepo.create({ sectionId: section6.id, title: 'Router Links and Navigation', content: 'Navigate between routes using routerLink and programmatic navigation.', type: 'video', duration: 20, order: 3, videoUrl: 'https://example.com/videos/angular/router-links.mp4' }),
      lessonRepo.create({ sectionId: section6.id, title: 'Route Parameters', content: 'Pass and retrieve parameters in routes using ActivatedRoute.', type: 'video', duration: 28, order: 4, videoUrl: 'https://example.com/videos/angular/route-parameters.mp4' }),
      lessonRepo.create({ sectionId: section6.id, title: 'Query Parameters', content: 'Work with query parameters and fragments in Angular routing.', type: 'video', duration: 22, order: 5, videoUrl: 'https://example.com/videos/angular/query-parameters.mp4' }),
      lessonRepo.create({ sectionId: section6.id, title: 'Child Routes and Nested Routing', content: 'Create complex routing hierarchies with child routes.', type: 'video', duration: 30, order: 6, videoUrl: 'https://example.com/videos/angular/child-routes.mp4' }),
      lessonRepo.create({ sectionId: section6.id, title: 'Route Guards', content: 'Protect routes using CanActivate, CanDeactivate, and Resolve guards.', type: 'video', duration: 35, order: 7, videoUrl: 'https://example.com/videos/angular/route-guards.mp4' }),
      lessonRepo.create({ sectionId: section6.id, title: 'Lazy Loading Modules', content: 'Improve application performance with lazy loading and code splitting.', type: 'video', duration: 32, order: 8, videoUrl: 'https://example.com/videos/angular/lazy-loading.mp4' })
    ]);

    console.log('Creating Section 7: Forms...');
    const section7 = sectionRepo.create({ courseId: angularCourse.id, title: 'Forms in Angular', order: 7, description: 'Master template-driven and reactive forms' });
    await sectionRepo.save(section7);

    await lessonRepo.save([
      lessonRepo.create({ sectionId: section7.id, title: 'Introduction to Forms', content: 'Overview of forms in Angular: template-driven vs reactive approaches.', type: 'video', duration: 15, order: 1, videoUrl: 'https://example.com/videos/angular/forms-intro.mp4' }),
      lessonRepo.create({ sectionId: section7.id, title: 'Template-Driven Forms', content: 'Build forms using the template-driven approach with ngModel.', type: 'video', duration: 30, order: 2, videoUrl: 'https://example.com/videos/angular/template-driven-forms.mp4' }),
      lessonRepo.create({ sectionId: section7.id, title: 'Form Validation (Template-Driven)', content: 'Add validation to template-driven forms and display error messages.', type: 'video', duration: 28, order: 3, videoUrl: 'https://example.com/videos/angular/template-validation.mp4' }),
      lessonRepo.create({ sectionId: section7.id, title: 'Reactive Forms Introduction', content: 'Introduction to reactive forms and FormControl, FormGroup.', type: 'video', duration: 25, order: 4, videoUrl: 'https://example.com/videos/angular/reactive-forms-intro.mp4' }),
      lessonRepo.create({ sectionId: section7.id, title: 'Building Reactive Forms', content: 'Create complex forms programmatically using ReactiveFormsModule.', type: 'video', duration: 35, order: 5, videoUrl: 'https://example.com/videos/angular/building-reactive-forms.mp4' }),
      lessonRepo.create({ sectionId: section7.id, title: 'Reactive Forms Validation', content: 'Add built-in and custom validators to reactive forms.', type: 'video', duration: 32, order: 6, videoUrl: 'https://example.com/videos/angular/reactive-validation.mp4' }),
      lessonRepo.create({ sectionId: section7.id, title: 'Dynamic Forms and FormArrays', content: 'Create dynamic forms where users can add or remove form controls.', type: 'video', duration: 38, order: 7, videoUrl: 'https://example.com/videos/angular/dynamic-forms.mp4' }),
      lessonRepo.create({ sectionId: section7.id, title: 'Custom Validators', content: 'Create custom synchronous and asynchronous validators.', type: 'video', duration: 30, order: 8, videoUrl: 'https://example.com/videos/angular/custom-validators.mp4' })
    ]);

    // Quiz 3
    const quiz3 = quizRepo.create({ courseId: angularCourse.id, title: 'Services, Routing, and Forms Quiz', description: 'Test your knowledge of Angular services, routing, and forms', passingScore: 70, timeLimit: 30 });
    await quizRepo.save(quiz3);

    const srfQ1 = questionRepo.create({ quizId: quiz3.id, question: 'What is the purpose of providedIn: "root" in a service decorator?', type: 'multiple-choice', points: 10, order: 1 });
    await questionRepo.save(srfQ1);
    await optionRepo.save([
      optionRepo.create({ questionId: srfQ1.id, text: 'Makes the service available only in the root component', order: 1, isCorrect: false }),
      optionRepo.create({ questionId: srfQ1.id, text: 'Makes the service a singleton available application-wide', order: 2, isCorrect: true }),
      optionRepo.create({ questionId: srfQ1.id, text: 'Makes the service private', order: 3, isCorrect: false }),
      optionRepo.create({ questionId: srfQ1.id, text: 'Makes the service lazy-loaded', order: 4, isCorrect: false })
    ]);

    const srfQ2 = questionRepo.create({ quizId: quiz3.id, question: 'Which guard would you use to prevent navigation away from a route with unsaved changes?', type: 'multiple-choice', points: 10, order: 2 });
    await questionRepo.save(srfQ2);
    await optionRepo.save([
      optionRepo.create({ questionId: srfQ2.id, text: 'CanActivate', order: 1, isCorrect: false }),
      optionRepo.create({ questionId: srfQ2.id, text: 'CanDeactivate', order: 2, isCorrect: true }),
      optionRepo.create({ questionId: srfQ2.id, text: 'CanLoad', order: 3, isCorrect: false }),
      optionRepo.create({ questionId: srfQ2.id, text: 'Resolve', order: 4, isCorrect: false })
    ]);

    const srfQ3 = questionRepo.create({ quizId: quiz3.id, question: 'Which module do you need to import to use reactive forms?', type: 'multiple-choice', points: 10, order: 3 });
    await questionRepo.save(srfQ3);
    await optionRepo.save([
      optionRepo.create({ questionId: srfQ3.id, text: 'FormsModule', order: 1, isCorrect: false }),
      optionRepo.create({ questionId: srfQ3.id, text: 'ReactiveFormsModule', order: 2, isCorrect: true }),
      optionRepo.create({ questionId: srfQ3.id, text: 'HttpClientModule', order: 3, isCorrect: false }),
      optionRepo.create({ questionId: srfQ3.id, text: 'CommonModule', order: 4, isCorrect: false })
    ]);

    console.log('Creating Section 8: HTTP & Observables...');
    const section8 = sectionRepo.create({ courseId: angularCourse.id, title: 'HTTP & Observables', order: 8, description: 'Learn to communicate with backend APIs using HttpClient and master RxJS Observables' });
    await sectionRepo.save(section8);

    await lessonRepo.save([
      lessonRepo.create({ sectionId: section8.id, title: 'Introduction to Observables and RxJS', content: 'Understanding reactive programming with RxJS Observables, Observers, and Subscriptions.', type: 'video', duration: 25, order: 1, videoUrl: 'https://example.com/videos/angular/observables-intro.mp4' }),
      lessonRepo.create({ sectionId: section8.id, title: 'HttpClient Setup', content: 'Set up HttpClientModule and make your first HTTP request in Angular.', type: 'video', duration: 20, order: 2, videoUrl: 'https://example.com/videos/angular/httpclient-setup.mp4' }),
      lessonRepo.create({ sectionId: section8.id, title: 'GET Requests', content: 'Fetch data from APIs using HTTP GET requests and handle responses.', type: 'video', duration: 25, order: 3, videoUrl: 'https://example.com/videos/angular/get-requests.mp4' }),
      lessonRepo.create({ sectionId: section8.id, title: 'POST, PUT, and DELETE Requests', content: 'Learn to create, update, and delete data using HTTP methods.', type: 'video', duration: 30, order: 4, videoUrl: 'https://example.com/videos/angular/post-put-delete.mp4' }),
      lessonRepo.create({ sectionId: section8.id, title: 'HTTP Headers and Parameters', content: 'Add custom headers and URL parameters to your HTTP requests.', type: 'video', duration: 22, order: 5, videoUrl: 'https://example.com/videos/angular/http-headers-params.mp4' }),
      lessonRepo.create({ sectionId: section8.id, title: 'Error Handling', content: 'Properly handle HTTP errors using catchError and retry operators.', type: 'video', duration: 28, order: 6, videoUrl: 'https://example.com/videos/angular/error-handling.mp4' }),
      lessonRepo.create({ sectionId: section8.id, title: 'HTTP Interceptors', content: 'Create interceptors to modify requests and responses globally.', type: 'video', duration: 32, order: 7, videoUrl: 'https://example.com/videos/angular/http-interceptors.mp4' }),
      lessonRepo.create({ sectionId: section8.id, title: 'RxJS Operators Deep Dive', content: 'Master essential RxJS operators: map, filter, switchMap, mergeMap, and more.', type: 'video', duration: 40, order: 8, videoUrl: 'https://example.com/videos/angular/rxjs-operators.mp4' }),
      lessonRepo.create({ sectionId: section8.id, title: 'Subjects and BehaviorSubjects', content: 'Use Subjects for multi-casting and state management in services.', type: 'video', duration: 30, order: 9, videoUrl: 'https://example.com/videos/angular/subjects.mp4' })
    ]);

    console.log('Creating Section 9: Pipes...');
    const section9 = sectionRepo.create({ courseId: angularCourse.id, title: 'Pipes', order: 9, description: 'Transform data in templates using built-in and custom pipes' });
    await sectionRepo.save(section9);

    await lessonRepo.save([
      lessonRepo.create({ sectionId: section9.id, title: 'Introduction to Pipes', content: 'Understanding pipes and their role in transforming display data.', type: 'video', duration: 12, order: 1, videoUrl: 'https://example.com/videos/angular/pipes-intro.mp4' }),
      lessonRepo.create({ sectionId: section9.id, title: 'Built-in Pipes', content: 'Learn about DatePipe, CurrencyPipe, DecimalPipe, PercentPipe, and more.', type: 'video', duration: 25, order: 2, videoUrl: 'https://example.com/videos/angular/builtin-pipes.mp4' }),
      lessonRepo.create({ sectionId: section9.id, title: 'Parameterizing Pipes', content: 'Pass parameters to pipes to customize their behavior.', type: 'video', duration: 18, order: 3, videoUrl: 'https://example.com/videos/angular/pipe-parameters.mp4' }),
      lessonRepo.create({ sectionId: section9.id, title: 'Creating Custom Pipes', content: 'Build your own custom pipes to transform data.', type: 'video', duration: 28, order: 4, videoUrl: 'https://example.com/videos/angular/custom-pipes.mp4' }),
      lessonRepo.create({ sectionId: section9.id, title: 'Async Pipe', content: 'Master the async pipe to automatically subscribe to Observables in templates.', type: 'video', duration: 25, order: 5, videoUrl: 'https://example.com/videos/angular/async-pipe.mp4' }),
      lessonRepo.create({ sectionId: section9.id, title: 'Pure vs Impure Pipes', content: 'Understanding pipe purity and performance implications.', type: 'video', duration: 22, order: 6, videoUrl: 'https://example.com/videos/angular/pure-impure-pipes.mp4' })
    ]);

    console.log('Creating Section 10: Authentication & Authorization...');
    const section10 = sectionRepo.create({ courseId: angularCourse.id, title: 'Authentication & Authorization', order: 10, description: 'Implement user authentication and protect routes' });
    await sectionRepo.save(section10);

    await lessonRepo.save([
      lessonRepo.create({ sectionId: section10.id, title: 'Authentication Overview', content: 'Understanding authentication strategies: JWT, OAuth, session-based auth.', type: 'video', duration: 20, order: 1, videoUrl: 'https://example.com/videos/angular/auth-overview.mp4' }),
      lessonRepo.create({ sectionId: section10.id, title: 'Building Login and Signup Forms', content: 'Create user login and registration forms with validation.', type: 'video', duration: 30, order: 2, videoUrl: 'https://example.com/videos/angular/login-signup.mp4' }),
      lessonRepo.create({ sectionId: section10.id, title: 'JWT Token Authentication', content: 'Implement JWT-based authentication with token storage and management.', type: 'video', duration: 35, order: 3, videoUrl: 'https://example.com/videos/angular/jwt-auth.mp4' }),
      lessonRepo.create({ sectionId: section10.id, title: 'Auth Guards and Route Protection', content: 'Protect routes from unauthorized access using authentication guards.', type: 'video', duration: 28, order: 4, videoUrl: 'https://example.com/videos/angular/auth-guards.mp4' }),
      lessonRepo.create({ sectionId: section10.id, title: 'Auth Interceptor', content: 'Automatically attach authentication tokens to HTTP requests.', type: 'video', duration: 25, order: 5, videoUrl: 'https://example.com/videos/angular/auth-interceptor.mp4' }),
      lessonRepo.create({ sectionId: section10.id, title: 'Handling Token Refresh', content: 'Implement automatic token refresh for seamless user experience.', type: 'video', duration: 32, order: 6, videoUrl: 'https://example.com/videos/angular/token-refresh.mp4' }),
      lessonRepo.create({ sectionId: section10.id, title: 'Role-Based Access Control', content: 'Implement role-based authorization to restrict access based on user roles.', type: 'video', duration: 30, order: 7, videoUrl: 'https://example.com/videos/angular/rbac.mp4' })
    ]);

    // Quiz 4
    const quiz4 = quizRepo.create({ courseId: angularCourse.id, title: 'Advanced Angular Concepts Quiz', description: 'Test your knowledge of HTTP, Observables, Authentication, and more', passingScore: 75, timeLimit: 35 });
    await quizRepo.save(quiz4);

    const advQ1 = questionRepo.create({ quizId: quiz4.id, question: 'Which RxJS operator would you use to transform each emitted value?', type: 'multiple-choice', points: 10, order: 1 });
    await questionRepo.save(advQ1);
    await optionRepo.save([
      optionRepo.create({ questionId: advQ1.id, text: 'filter', order: 1, isCorrect: false }),
      optionRepo.create({ questionId: advQ1.id, text: 'map', order: 2, isCorrect: true }),
      optionRepo.create({ questionId: advQ1.id, text: 'tap', order: 3, isCorrect: false }),
      optionRepo.create({ questionId: advQ1.id, text: 'catchError', order: 4, isCorrect: false })
    ]);

    const advQ2 = questionRepo.create({ quizId: quiz4.id, question: 'What is the purpose of HTTP Interceptors?', type: 'multiple-choice', points: 10, order: 2 });
    await questionRepo.save(advQ2);
    await optionRepo.save([
      optionRepo.create({ questionId: advQ2.id, text: 'To cache HTTP responses', order: 1, isCorrect: false }),
      optionRepo.create({ questionId: advQ2.id, text: 'To globally modify HTTP requests and responses', order: 2, isCorrect: true }),
      optionRepo.create({ questionId: advQ2.id, text: 'To validate form inputs', order: 3, isCorrect: false }),
      optionRepo.create({ questionId: advQ2.id, text: 'To lazy load modules', order: 4, isCorrect: false })
    ]);

    console.log('Creating Section 11 through 15 for comprehensive coverage...');
    
    // Create remaining sections with representative lessons
    const remainingSections = [
      { title: 'State Management with NgRx', order: 11, description: 'Learn advanced state management using NgRx Store, Effects, and Selectors' },
      { title: 'Testing Angular Applications', order: 12, description: 'Learn unit testing and end-to-end testing for Angular apps' },
      { title: 'Performance Optimization', order: 13, description: 'Optimize your Angular applications for better performance' },
      { title: 'Angular Material', order: 14, description: 'Build beautiful UIs with Angular Material component library' },
      { title: 'Deployment & Best Practices', order: 15, description: 'Deploy your Angular application and learn industry best practices' }
    ];

    for (const sectionData of remainingSections) {
      const section = sectionRepo.create({
        courseId: angularCourse.id,
        ...sectionData
      });
      await sectionRepo.save(section);

      // Add a few representative lessons for each section
      await lessonRepo.save([
        lessonRepo.create({
          sectionId: section.id,
          title: `Introduction to ${sectionData.title}`,
          content: `Learn the fundamentals of ${sectionData.title}.`,
          type: 'video',
          duration: 20,
          order: 1,
          videoUrl: `https://example.com/videos/angular/section-${sectionData.order}-intro.mp4`
        }),
        lessonRepo.create({
          sectionId: section.id,
          title: `Advanced ${sectionData.title}`,
          content: `Deep dive into advanced topics in ${sectionData.title}.`,
          type: 'video',
          duration: 35,
          order: 2,
          videoUrl: `https://example.com/videos/angular/section-${sectionData.order}-advanced.mp4`
        }),
        lessonRepo.create({
          sectionId: section.id,
          title: `Practical Examples`,
          content: `Hands-on practical examples and real-world use cases.`,
          type: 'video',
          duration: 40,
          order: 3,
          videoUrl: `https://example.com/videos/angular/section-${sectionData.order}-examples.mp4`
        })
      ]);
    }

    // Final comprehensive quiz
    const finalQuiz = quizRepo.create({
      courseId: angularCourse.id,
      title: 'Final Comprehensive Quiz',
      description: 'Test your complete Angular knowledge across all topics',
      passingScore: 80,
      timeLimit: 45
    });
    await quizRepo.save(finalQuiz);

    const finalQ1 = questionRepo.create({ quizId: finalQuiz.id, question: 'What is Angular?', type: 'multiple-choice', points: 5, order: 1 });
    await questionRepo.save(finalQ1);
    await optionRepo.save([
      optionRepo.create({ questionId: finalQ1.id, text: 'A JavaScript library', order: 1, isCorrect: false }),
      optionRepo.create({ questionId: finalQ1.id, text: 'A TypeScript-based web application framework', order: 2, isCorrect: true }),
      optionRepo.create({ questionId: finalQ1.id, text: 'A CSS framework', order: 3, isCorrect: false }),
      optionRepo.create({ questionId: finalQ1.id, text: 'A database management system', order: 4, isCorrect: false })
    ]);

    const finalQ2 = questionRepo.create({ quizId: finalQuiz.id, question: 'Which change detection strategy improves performance?', type: 'multiple-choice', points: 5, order: 2 });
    await questionRepo.save(finalQ2);
    await optionRepo.save([
      optionRepo.create({ questionId: finalQ2.id, text: 'Default', order: 1, isCorrect: false }),
      optionRepo.create({ questionId: finalQ2.id, text: 'OnPush', order: 2, isCorrect: true }),
      optionRepo.create({ questionId: finalQ2.id, text: 'Always', order: 3, isCorrect: false }),
      optionRepo.create({ questionId: finalQ2.id, text: 'Never', order: 4, isCorrect: false })
    ]);

    // Other courses (simplified)
    console.log('Creating other courses...');
    const reactCourse = courseRepo.create({
      title: 'React - The Complete Guide',
      description: 'Dive in and learn React.js from scratch! Learn React, Hooks, Redux, React Router, Next.js, Best Practices and way more!',
      instructor: 'Maximilian Schwarzmüller',
      duration: 2880,
      price: 89.99,
      category: 'Web Development',
      level: 'Beginner',
      thumbnailUrl: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=400&h=250&fit=crop',
      bannerUrl: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=1200&h=400&fit=crop',
      enrollmentCount: 2156,
      rating: 4.8,
      published: true
    });
    await courseRepo.save(reactCourse);

    const nodeCourse = courseRepo.create({
      title: 'Node.js - The Complete Guide',
      description: 'Master Node JS & Deno.js, build REST APIs with Node.js, GraphQL APIs, add Authentication, use MongoDB, SQL & much more!',
      instructor: 'Maximilian Schwarzmüller',
      duration: 2520,
      price: 94.99,
      category: 'Web Development',
      level: 'Intermediate',
      thumbnailUrl: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=250&fit=crop',
      bannerUrl: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=1200&h=400&fit=crop',
      enrollmentCount: 892,
      rating: 4.6,
      published: true
    });
    await courseRepo.save(nodeCourse);

    // Course 4: OpenEdge 4GL Complete Course
    console.log('Creating comprehensive OpenEdge 4GL course...');
    const openEdgeCourse = courseRepo.create({
      title: 'OpenEdge 4GL (Progress ABL) - Interactive Comprehensive Course',
      description: 'Master OpenEdge 4GL from complete beginner to professional enterprise developer. Learn 19 structured lessons covering basics, database operations, OOP, web services, and advanced professional topics. Build 6 real-world projects including customer management, order processing, and inventory systems. This comprehensive course includes hands-on practice exercises, interactive quizzes with detailed answer keys, and progressive difficulty with enterprise best practices.',
      instructor: 'OpenEdge Professionals',
      duration: 3000, // 50 hours (40-60 hours estimated)
      price: 79.99,
      category: 'Programming',
      level: 'Beginner',
      thumbnailUrl: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=250&fit=crop',
      bannerUrl: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=1200&h=400&fit=crop',
      enrollmentCount: 342,
      rating: 4.8,
      language: 'English',
      requirements: [
        'No prior programming experience required',
        'OpenEdge development environment (trial version acceptable)',
        'Windows, Linux, or macOS computer',
        'Eagerness to learn enterprise application development'
      ],
      learningOutcomes: [
        'Master OpenEdge 4GL syntax and programming fundamentals from scratch',
        'Build database-driven applications with CRUD operations and transaction management',
        'Implement object-oriented programming concepts in OpenEdge',
        'Create professional data entry forms and reports',
        'Develop web services and integrate with modern APIs using JSON',
        'Apply enterprise best practices for variable scoping, temp-tables, and datasets',
        'Build a complete enterprise order management system (capstone project)'
      ],
      published: true
    });
    await courseRepo.save(openEdgeCourse);

    console.log('Creating OpenEdge 4GL sections and lessons...');

    // Section 1: Foundations
    const openEdgeSection1 = sectionRepo.create({
      courseId: openEdgeCourse.id,
      title: 'Foundations',
      order: 1,
      description: 'Learn the fundamentals of OpenEdge 4GL programming - syntax, variables, data types, and user interaction'
    });
    await sectionRepo.save(openEdgeSection1);

    await lessonRepo.save([
      lessonRepo.create({
        sectionId: openEdgeSection1.id,
        title: 'Your First OpenEdge Program',
        content: 'Introduction to OpenEdge 4GL: Understanding file extensions (.p, .w, .cls), writing your first program with DISPLAY statements, learning key syntax rules including the importance of periods, and hands-on exercises to practice basic programming concepts.',
        type: 'text',
        duration: 25,
        order: 1
      }),
      lessonRepo.create({
        sectionId: openEdgeSection1.id,
        title: 'Variables and Data Types',
        content: 'Master variables in OpenEdge: Defining variables with DEFINE VARIABLE and NO-UNDO, understanding common data types (CHARACTER, INTEGER, DECIMAL, LOGICAL, DATE, DATETIME), learning about the mystery of "?" (unknown value), assigning values, and variable naming rules. Includes complete examples with student information system.',
        type: 'text',
        duration: 30,
        order: 2
      }),
      lessonRepo.create({
        sectionId: openEdgeSection1.id,
        title: 'User Input and Interaction',
        content: 'Learn to interact with users: Getting input with UPDATE statements, formatting with LABEL, using Frames for better layout, implementing message boxes (alerts, confirmations, errors, warnings), and building a complete interactive calculator with proper user interface design.',
        type: 'text',
        duration: 28,
        order: 3
      })
    ]);

    // Quiz 1: Foundations
    const openEdgeQuiz1 = quizRepo.create({
      courseId: openEdgeCourse.id,
      title: 'Foundations Quiz (Lessons 1-3)',
      description: 'Test your understanding of OpenEdge 4GL basics: syntax, variables, data types, and user interaction',
      passingScore: 70,
      timeLimit: 15
    });
    await quizRepo.save(openEdgeQuiz1);

    const oeQ1_1 = questionRepo.create({ quizId: openEdgeQuiz1.id, question: 'What symbol ends every statement in OpenEdge 4GL?', type: 'multiple-choice', points: 10, order: 1 });
    await questionRepo.save(oeQ1_1);
    await optionRepo.save([
      optionRepo.create({ questionId: oeQ1_1.id, text: '. (period)', order: 1, isCorrect: true }),
      optionRepo.create({ questionId: oeQ1_1.id, text: '; (semicolon)', order: 2, isCorrect: false }),
      optionRepo.create({ questionId: oeQ1_1.id, text: ': (colon)', order: 3, isCorrect: false }),
      optionRepo.create({ questionId: oeQ1_1.id, text: '! (exclamation)', order: 4, isCorrect: false })
    ]);

    const oeQ1_2 = questionRepo.create({ quizId: openEdgeQuiz1.id, question: 'Which keyword is used to output data to the screen?', type: 'multiple-choice', points: 10, order: 2 });
    await questionRepo.save(oeQ1_2);
    await optionRepo.save([
      optionRepo.create({ questionId: oeQ1_2.id, text: 'PRINT', order: 1, isCorrect: false }),
      optionRepo.create({ questionId: oeQ1_2.id, text: 'OUTPUT', order: 2, isCorrect: false }),
      optionRepo.create({ questionId: oeQ1_2.id, text: 'DISPLAY', order: 3, isCorrect: true }),
      optionRepo.create({ questionId: oeQ1_2.id, text: 'SHOW', order: 4, isCorrect: false })
    ]);

    const oeQ1_3 = questionRepo.create({ quizId: openEdgeQuiz1.id, question: 'What does NO-UNDO mean when defining a variable?', type: 'multiple-choice', points: 10, order: 3 });
    await questionRepo.save(oeQ1_3);
    await optionRepo.save([
      optionRepo.create({ questionId: oeQ1_3.id, text: 'The variable cannot be changed', order: 1, isCorrect: false }),
      optionRepo.create({ questionId: oeQ1_3.id, text: 'The variable is not tracked for transaction rollback (improves performance)', order: 2, isCorrect: true }),
      optionRepo.create({ questionId: oeQ1_3.id, text: 'The variable is private', order: 3, isCorrect: false }),
      optionRepo.create({ questionId: oeQ1_3.id, text: 'The variable is temporary', order: 4, isCorrect: false })
    ]);

    const oeQ1_4 = questionRepo.create({ quizId: openEdgeQuiz1.id, question: 'What is the correct way to define an integer variable named "age"?', type: 'multiple-choice', points: 10, order: 4 });
    await questionRepo.save(oeQ1_4);
    await optionRepo.save([
      optionRepo.create({ questionId: oeQ1_4.id, text: 'int age;', order: 1, isCorrect: false }),
      optionRepo.create({ questionId: oeQ1_4.id, text: 'DEFINE VARIABLE age AS INTEGER NO-UNDO.', order: 2, isCorrect: true }),
      optionRepo.create({ questionId: oeQ1_4.id, text: 'var age: integer;', order: 3, isCorrect: false }),
      optionRepo.create({ questionId: oeQ1_4.id, text: 'INTEGER age;', order: 4, isCorrect: false })
    ]);

    const oeQ1_5 = questionRepo.create({ quizId: openEdgeQuiz1.id, question: 'What does the "?" symbol represent in OpenEdge 4GL?', type: 'multiple-choice', points: 10, order: 5 });
    await questionRepo.save(oeQ1_5);
    await optionRepo.save([
      optionRepo.create({ questionId: oeQ1_5.id, text: 'A question mark character', order: 1, isCorrect: false }),
      optionRepo.create({ questionId: oeQ1_5.id, text: 'Unknown or null value', order: 2, isCorrect: true }),
      optionRepo.create({ questionId: oeQ1_5.id, text: 'A help command', order: 3, isCorrect: false }),
      optionRepo.create({ questionId: oeQ1_5.id, text: 'An error indicator', order: 4, isCorrect: false })
    ]);

    const oeQ1_6 = questionRepo.create({ quizId: openEdgeQuiz1.id, question: 'Which statement is used to get user input?', type: 'multiple-choice', points: 10, order: 6 });
    await questionRepo.save(oeQ1_6);
    await optionRepo.save([
      optionRepo.create({ questionId: oeQ1_6.id, text: 'INPUT', order: 1, isCorrect: false }),
      optionRepo.create({ questionId: oeQ1_6.id, text: 'GET', order: 2, isCorrect: false }),
      optionRepo.create({ questionId: oeQ1_6.id, text: 'UPDATE', order: 3, isCorrect: true }),
      optionRepo.create({ questionId: oeQ1_6.id, text: 'READ', order: 4, isCorrect: false })
    ]);

    // Section 2: Control Flow
    const openEdgeSection2 = sectionRepo.create({
      courseId: openEdgeCourse.id,
      title: 'Control Flow',
      order: 2,
      description: 'Master conditional statements and loops in OpenEdge 4GL'
    });
    await sectionRepo.save(openEdgeSection2);

    await lessonRepo.save([
      lessonRepo.create({
        sectionId: openEdgeSection2.id,
        title: 'Control Structures',
        content: 'Learn decision-making in OpenEdge: IF-THEN-ELSE statements, comparison operators (=, <>, <, >, <=, >=), logical operators (AND, OR, NOT), CASE statements for multiple conditions, handling complex conditions, and nested IF statements for sophisticated logic. Includes age verification and grade calculator examples.',
        type: 'text',
        duration: 32,
        order: 1
      }),
      lessonRepo.create({
        sectionId: openEdgeSection2.id,
        title: 'Loops and Iteration',
        content: 'Master repetition in OpenEdge: DO WHILE loop (condition-based), DO...TO loop (counter-based), REPEAT loop (infinite with controlled exit), NEXT statement to skip iterations, LEAVE to exit loops, nested loops for complex patterns, and practical examples including multiplication tables and data processing.',
        type: 'text',
        duration: 35,
        order: 2
      })
    ]);

    // Quiz 2: Control Flow
    const openEdgeQuiz2 = quizRepo.create({
      courseId: openEdgeCourse.id,
      title: 'Control Flow Quiz (Lessons 4-5)',
      description: 'Test your knowledge of conditional statements, loops, and control structures',
      passingScore: 70,
      timeLimit: 15
    });
    await quizRepo.save(openEdgeQuiz2);

    const oeQ2_1 = questionRepo.create({ quizId: openEdgeQuiz2.id, question: 'Which statement is used to exit a REPEAT loop?', type: 'multiple-choice', points: 10, order: 1 });
    await questionRepo.save(oeQ2_1);
    await optionRepo.save([
      optionRepo.create({ questionId: oeQ2_1.id, text: 'EXIT', order: 1, isCorrect: false }),
      optionRepo.create({ questionId: oeQ2_1.id, text: 'BREAK', order: 2, isCorrect: false }),
      optionRepo.create({ questionId: oeQ2_1.id, text: 'LEAVE', order: 3, isCorrect: true }),
      optionRepo.create({ questionId: oeQ2_1.id, text: 'QUIT', order: 4, isCorrect: false })
    ]);

    const oeQ2_2 = questionRepo.create({ quizId: openEdgeQuiz2.id, question: 'How do you check if two values are NOT equal in OpenEdge 4GL?', type: 'multiple-choice', points: 10, order: 2 });
    await questionRepo.save(oeQ2_2);
    await optionRepo.save([
      optionRepo.create({ questionId: oeQ2_2.id, text: '!=', order: 1, isCorrect: false }),
      optionRepo.create({ questionId: oeQ2_2.id, text: '<>', order: 2, isCorrect: true }),
      optionRepo.create({ questionId: oeQ2_2.id, text: 'NE', order: 3, isCorrect: false }),
      optionRepo.create({ questionId: oeQ2_2.id, text: '!==', order: 4, isCorrect: false })
    ]);

    const oeQ2_3 = questionRepo.create({ quizId: openEdgeQuiz2.id, question: 'What will this code output? DO i = 1 TO 3: DISPLAY i. END.', type: 'multiple-choice', points: 10, order: 3 });
    await questionRepo.save(oeQ2_3);
    await optionRepo.save([
      optionRepo.create({ questionId: oeQ2_3.id, text: '0 1 2', order: 1, isCorrect: false }),
      optionRepo.create({ questionId: oeQ2_3.id, text: '1 2 3', order: 2, isCorrect: true }),
      optionRepo.create({ questionId: oeQ2_3.id, text: '1 2 3 4', order: 3, isCorrect: false }),
      optionRepo.create({ questionId: oeQ2_3.id, text: '3', order: 4, isCorrect: false })
    ]);

    const oeQ2_4 = questionRepo.create({ quizId: openEdgeQuiz2.id, question: 'Which logical operator would you use to combine two conditions where BOTH must be true?', type: 'multiple-choice', points: 10, order: 4 });
    await questionRepo.save(oeQ2_4);
    await optionRepo.save([
      optionRepo.create({ questionId: oeQ2_4.id, text: 'OR', order: 1, isCorrect: false }),
      optionRepo.create({ questionId: oeQ2_4.id, text: 'AND', order: 2, isCorrect: true }),
      optionRepo.create({ questionId: oeQ2_4.id, text: 'NOT', order: 3, isCorrect: false }),
      optionRepo.create({ questionId: oeQ2_4.id, text: 'THEN', order: 4, isCorrect: false })
    ]);

    const oeQ2_5 = questionRepo.create({ quizId: openEdgeQuiz2.id, question: 'What does the NEXT statement do in a loop?', type: 'multiple-choice', points: 10, order: 5 });
    await questionRepo.save(oeQ2_5);
    await optionRepo.save([
      optionRepo.create({ questionId: oeQ2_5.id, text: 'Skip to the next iteration', order: 1, isCorrect: true }),
      optionRepo.create({ questionId: oeQ2_5.id, text: 'Exit the loop completely', order: 2, isCorrect: false }),
      optionRepo.create({ questionId: oeQ2_5.id, text: 'Pause the loop', order: 3, isCorrect: false }),
      optionRepo.create({ questionId: oeQ2_5.id, text: 'Repeat the current iteration', order: 4, isCorrect: false })
    ]);

    const oeQ2_6 = questionRepo.create({ quizId: openEdgeQuiz2.id, question: 'What is the result of "5 MODULO 2"?', type: 'multiple-choice', points: 10, order: 6 });
    await questionRepo.save(oeQ2_6);
    await optionRepo.save([
      optionRepo.create({ questionId: oeQ2_6.id, text: '0', order: 1, isCorrect: false }),
      optionRepo.create({ questionId: oeQ2_6.id, text: '1', order: 2, isCorrect: true }),
      optionRepo.create({ questionId: oeQ2_6.id, text: '2', order: 3, isCorrect: false }),
      optionRepo.create({ questionId: oeQ2_6.id, text: '5', order: 4, isCorrect: false })
    ]);

    // Section 3: Database Operations
    const openEdgeSection3 = sectionRepo.create({
      courseId: openEdgeCourse.id,
      title: 'Database Operations',
      order: 3,
      description: 'Learn to work with the OpenEdge database: CRUD operations, transactions, and error handling'
    });
    await sectionRepo.save(openEdgeSection3);

    await lessonRepo.save([
      lessonRepo.create({
        sectionId: openEdgeSection3.id,
        title: 'Working with the Database',
        content: 'Master database operations in OpenEdge: Understanding the integrated database system, database connections, FOR EACH for reading all records, WHERE clause for filtering, FIND for specific records, lock types (NO-LOCK, EXCLUSIVE-LOCK, SHARE-LOCK), sorting with BY, creating records with CREATE, updating with ASSIGN, deleting with DELETE, counting and calculating totals. Includes complete customer management examples.',
        type: 'text',
        duration: 40,
        order: 1
      }),
      lessonRepo.create({
        sectionId: openEdgeSection3.id,
        title: 'Transactions and Error Handling',
        content: 'Learn professional error handling: Understanding ACID transactions, transaction blocks, UNDO keyword for rollback, NO-ERROR flag, checking ERROR-STATUS, modern error handling with CATCH blocks (TRY-CATCH), FINALLY blocks for cleanup, ROUTINE-LEVEL error handling, and complete examples with customer database updates and order processing with validation.',
        type: 'text',
        duration: 38,
        order: 2
      })
    ]);

    // Quiz 3: Database Operations
    const openEdgeQuiz3 = quizRepo.create({
      courseId: openEdgeCourse.id,
      title: 'Database and Transactions Quiz (Lessons 6-7)',
      description: 'Test your knowledge of database operations, transactions, and error handling',
      passingScore: 70,
      timeLimit: 15
    });
    await quizRepo.save(openEdgeQuiz3);

    const oeQ3_1 = questionRepo.create({ quizId: openEdgeQuiz3.id, question: 'Which lock type should you use for read-only operations?', type: 'multiple-choice', points: 10, order: 1 });
    await questionRepo.save(oeQ3_1);
    await optionRepo.save([
      optionRepo.create({ questionId: oeQ3_1.id, text: 'EXCLUSIVE-LOCK', order: 1, isCorrect: false }),
      optionRepo.create({ questionId: oeQ3_1.id, text: 'NO-LOCK', order: 2, isCorrect: true }),
      optionRepo.create({ questionId: oeQ3_1.id, text: 'SHARE-LOCK', order: 3, isCorrect: false }),
      optionRepo.create({ questionId: oeQ3_1.id, text: 'READ-LOCK', order: 4, isCorrect: false })
    ]);

    const oeQ3_2 = questionRepo.create({ quizId: openEdgeQuiz3.id, question: 'What does the UNDO keyword do in a transaction block?', type: 'multiple-choice', points: 10, order: 2 });
    await questionRepo.save(oeQ3_2);
    await optionRepo.save([
      optionRepo.create({ questionId: oeQ3_2.id, text: 'Reverses all changes made in the transaction', order: 1, isCorrect: true }),
      optionRepo.create({ questionId: oeQ3_2.id, text: 'Stops the program', order: 2, isCorrect: false }),
      optionRepo.create({ questionId: oeQ3_2.id, text: 'Deletes the database', order: 3, isCorrect: false }),
      optionRepo.create({ questionId: oeQ3_2.id, text: 'Restarts the loop', order: 4, isCorrect: false })
    ]);

    const oeQ3_3 = questionRepo.create({ quizId: openEdgeQuiz3.id, question: 'How do you check if a FIND statement successfully found a record?', type: 'multiple-choice', points: 10, order: 3 });
    await questionRepo.save(oeQ3_3);
    await optionRepo.save([
      optionRepo.create({ questionId: oeQ3_3.id, text: 'IF FOUND THEN...', order: 1, isCorrect: false }),
      optionRepo.create({ questionId: oeQ3_3.id, text: 'IF AVAILABLE(table-name) THEN...', order: 2, isCorrect: true }),
      optionRepo.create({ questionId: oeQ3_3.id, text: 'IF EXISTS THEN...', order: 3, isCorrect: false }),
      optionRepo.create({ questionId: oeQ3_3.id, text: 'IF SUCCESS THEN...', order: 4, isCorrect: false })
    ]);

    const oeQ3_4 = questionRepo.create({ quizId: openEdgeQuiz3.id, question: 'Which statement creates a new database record?', type: 'multiple-choice', points: 10, order: 4 });
    await questionRepo.save(oeQ3_4);
    await optionRepo.save([
      optionRepo.create({ questionId: oeQ3_4.id, text: 'NEW', order: 1, isCorrect: false }),
      optionRepo.create({ questionId: oeQ3_4.id, text: 'CREATE', order: 2, isCorrect: true }),
      optionRepo.create({ questionId: oeQ3_4.id, text: 'INSERT', order: 3, isCorrect: false }),
      optionRepo.create({ questionId: oeQ3_4.id, text: 'ADD', order: 4, isCorrect: false })
    ]);

    const oeQ3_5 = questionRepo.create({ quizId: openEdgeQuiz3.id, question: 'What does the NO-ERROR option do?', type: 'multiple-choice', points: 10, order: 5 });
    await questionRepo.save(oeQ3_5);
    await optionRepo.save([
      optionRepo.create({ questionId: oeQ3_5.id, text: 'Prevents all errors from occurring', order: 1, isCorrect: false }),
      optionRepo.create({ questionId: oeQ3_5.id, text: 'Suppresses error messages and allows you to check ERROR-STATUS', order: 2, isCorrect: true }),
      optionRepo.create({ questionId: oeQ3_5.id, text: 'Fixes errors automatically', order: 3, isCorrect: false }),
      optionRepo.create({ questionId: oeQ3_5.id, text: 'Logs errors to a file', order: 4, isCorrect: false })
    ]);

    const oeQ3_6 = questionRepo.create({ quizId: openEdgeQuiz3.id, question: 'What does the LEAVE statement do in a transaction block?', type: 'multiple-choice', points: 10, order: 6 });
    await questionRepo.save(oeQ3_6);
    await optionRepo.save([
      optionRepo.create({ questionId: oeQ3_6.id, text: 'Commits changes and exits the block', order: 1, isCorrect: true }),
      optionRepo.create({ questionId: oeQ3_6.id, text: 'Exits without committing', order: 2, isCorrect: false }),
      optionRepo.create({ questionId: oeQ3_6.id, text: 'Rolls back all changes', order: 3, isCorrect: false }),
      optionRepo.create({ questionId: oeQ3_6.id, text: 'Pauses execution', order: 4, isCorrect: false })
    ]);

    // Section 4: Modular Programming
    const openEdgeSection4 = sectionRepo.create({
      courseId: openEdgeCourse.id,
      title: 'Modular Programming',
      order: 4,
      description: 'Build reusable code with procedures, functions, and professional data entry forms'
    });
    await sectionRepo.save(openEdgeSection4);

    await lessonRepo.save([
      lessonRepo.create({
        sectionId: openEdgeSection4.id,
        title: 'Procedures and Functions',
        content: 'Master code organization: Understanding the benefits of modular programming, internal procedures with PROCEDURE...END PROCEDURE, parameter types (INPUT, OUTPUT, INPUT-OUTPUT), calling procedures with RUN, external procedures in separate files, user-defined functions with FUNCTION...RETURN, function parameters and return values, and best practices for naming, documentation, error handling, and keeping procedures focused. Includes calculator and customer validation examples.',
        type: 'text',
        duration: 42,
        order: 1
      }),
      lessonRepo.create({
        sectionId: openEdgeSection4.id,
        title: 'Building Data Entry Forms',
        content: 'Create professional user interfaces: Simple forms with UPDATE and frames, forms with BROWSE widgets for list display, ENABLE/DISABLE for field control, button handling with triggers (CHOOSE event), complete CRUD forms with add/update/delete functionality, form validation, and user feedback. Includes customer management system with full create, read, update, and delete operations.',
        type: 'text',
        duration: 45,
        order: 2
      })
    ]);

    // Quiz 4: Modular Programming
    const openEdgeQuiz4 = quizRepo.create({
      courseId: openEdgeCourse.id,
      title: 'Procedures and Forms Quiz (Lessons 8-9)',
      description: 'Test your understanding of procedures, functions, and building data entry forms',
      passingScore: 70,
      timeLimit: 12
    });
    await quizRepo.save(openEdgeQuiz4);

    const oeQ4_1 = questionRepo.create({ quizId: openEdgeQuiz4.id, question: 'Which keyword defines a parameter that returns a value from a procedure?', type: 'multiple-choice', points: 10, order: 1 });
    await questionRepo.save(oeQ4_1);
    await optionRepo.save([
      optionRepo.create({ questionId: oeQ4_1.id, text: 'RETURN', order: 1, isCorrect: false }),
      optionRepo.create({ questionId: oeQ4_1.id, text: 'OUTPUT', order: 2, isCorrect: true }),
      optionRepo.create({ questionId: oeQ4_1.id, text: 'EXPORT', order: 3, isCorrect: false }),
      optionRepo.create({ questionId: oeQ4_1.id, text: 'OUT', order: 4, isCorrect: false })
    ]);

    const oeQ4_2 = questionRepo.create({ quizId: openEdgeQuiz4.id, question: 'How do you call an internal procedure named "calculateTotal"?', type: 'multiple-choice', points: 10, order: 2 });
    await questionRepo.save(oeQ4_2);
    await optionRepo.save([
      optionRepo.create({ questionId: oeQ4_2.id, text: 'CALL calculateTotal.', order: 1, isCorrect: false }),
      optionRepo.create({ questionId: oeQ4_2.id, text: 'RUN calculateTotal.', order: 2, isCorrect: true }),
      optionRepo.create({ questionId: oeQ4_2.id, text: 'EXECUTE calculateTotal.', order: 3, isCorrect: false }),
      optionRepo.create({ questionId: oeQ4_2.id, text: 'calculateTotal().', order: 4, isCorrect: false })
    ]);

    const oeQ4_3 = questionRepo.create({ quizId: openEdgeQuiz4.id, question: 'What is the main difference between a procedure and a function in OpenEdge?', type: 'multiple-choice', points: 10, order: 3 });
    await questionRepo.save(oeQ4_3);
    await optionRepo.save([
      optionRepo.create({ questionId: oeQ4_3.id, text: 'Functions are faster', order: 1, isCorrect: false }),
      optionRepo.create({ questionId: oeQ4_3.id, text: 'Functions can return a value directly and be used in expressions', order: 2, isCorrect: true }),
      optionRepo.create({ questionId: oeQ4_3.id, text: 'Procedures can have parameters', order: 3, isCorrect: false }),
      optionRepo.create({ questionId: oeQ4_3.id, text: 'There is no difference', order: 4, isCorrect: false })
    ]);

    const oeQ4_4 = questionRepo.create({ quizId: openEdgeQuiz4.id, question: 'What does an INPUT-OUTPUT parameter allow?', type: 'multiple-choice', points: 10, order: 4 });
    await questionRepo.save(oeQ4_4);
    await optionRepo.save([
      optionRepo.create({ questionId: oeQ4_4.id, text: 'Only receive values', order: 1, isCorrect: false }),
      optionRepo.create({ questionId: oeQ4_4.id, text: 'Only return values', order: 2, isCorrect: false }),
      optionRepo.create({ questionId: oeQ4_4.id, text: 'Both receive and return values', order: 3, isCorrect: true }),
      optionRepo.create({ questionId: oeQ4_4.id, text: 'Display values on screen', order: 4, isCorrect: false })
    ]);

    // Section 5: Advanced Concepts
    const openEdgeSection5 = sectionRepo.create({
      courseId: openEdgeCourse.id,
      title: 'Advanced Concepts',
      order: 5,
      description: 'Master object-oriented programming, reports, and web services integration'
    });
    await sectionRepo.save(openEdgeSection5);

    await lessonRepo.save([
      lessonRepo.create({
        sectionId: openEdgeSection5.id,
        title: 'Object-Oriented Programming',
        content: 'Introduction to OOP in OpenEdge: Understanding classes and objects, defining classes with CLASS...END CLASS, properties and methods, constructors, creating instances with NEW, inheritance with INHERITS, overriding methods, and practical examples with Customer and BankAccount classes. Learn encapsulation, polymorphism, and when to use OOP vs procedural programming.',
        type: 'text',
        duration: 38,
        order: 1
      }),
      lessonRepo.create({
        sectionId: openEdgeSection5.id,
        title: 'Reports and Queries',
        content: 'Generate professional reports: Simple reports with FOR EACH and formatting, using STREAM for file output, grouped reports with BREAK BY for subtotals and totals, calculating aggregates (SUM, COUNT, AVERAGE), report headers and footers, page breaks, and exporting to CSV format. Includes sales reports with product categories and customer order history examples.',
        type: 'text',
        duration: 35,
        order: 2
      }),
      lessonRepo.create({
        sectionId: openEdgeSection5.id,
        title: 'Web Services and Modern Integration',
        content: 'Integrate with modern applications: REST API basics, making HTTP requests, parsing JSON responses, building REST services in OpenEdge, handling authentication, error handling for network requests, and practical examples including consuming a weather API and building a customer lookup REST service. Learn SOAP basics and choosing between REST and SOAP.',
        type: 'text',
        duration: 40,
        order: 3
      })
    ]);

    // Quiz 5: Advanced Concepts
    const openEdgeQuiz5 = quizRepo.create({
      courseId: openEdgeCourse.id,
      title: 'Advanced Concepts Quiz (Lessons 10-12)',
      description: 'Test your knowledge of OOP, reports, and web services',
      passingScore: 75,
      timeLimit: 12
    });
    await quizRepo.save(openEdgeQuiz5);

    const oeQ5_1 = questionRepo.create({ quizId: openEdgeQuiz5.id, question: 'Which keyword is used to create a new instance of a class?', type: 'multiple-choice', points: 15, order: 1 });
    await questionRepo.save(oeQ5_1);
    await optionRepo.save([
      optionRepo.create({ questionId: oeQ5_1.id, text: 'CREATE', order: 1, isCorrect: false }),
      optionRepo.create({ questionId: oeQ5_1.id, text: 'NEW', order: 2, isCorrect: true }),
      optionRepo.create({ questionId: oeQ5_1.id, text: 'INSTANCE', order: 3, isCorrect: false }),
      optionRepo.create({ questionId: oeQ5_1.id, text: 'MAKE', order: 4, isCorrect: false })
    ]);

    const oeQ5_2 = questionRepo.create({ quizId: openEdgeQuiz5.id, question: 'What is inheritance in object-oriented programming?', type: 'multiple-choice', points: 15, order: 2 });
    await questionRepo.save(oeQ5_2);
    await optionRepo.save([
      optionRepo.create({ questionId: oeQ5_2.id, text: 'Copying code from one file to another', order: 1, isCorrect: false }),
      optionRepo.create({ questionId: oeQ5_2.id, text: 'A class extending another class to reuse and specialize its functionality', order: 2, isCorrect: true }),
      optionRepo.create({ questionId: oeQ5_2.id, text: 'Sharing variables between procedures', order: 3, isCorrect: false }),
      optionRepo.create({ questionId: oeQ5_2.id, text: 'Importing external libraries', order: 4, isCorrect: false })
    ]);

    const oeQ5_3 = questionRepo.create({ quizId: openEdgeQuiz5.id, question: 'How do you access a property of an object in OpenEdge?', type: 'multiple-choice', points: 10, order: 3 });
    await questionRepo.save(oeQ5_3);
    await optionRepo.save([
      optionRepo.create({ questionId: oeQ5_3.id, text: 'object.property', order: 1, isCorrect: false }),
      optionRepo.create({ questionId: oeQ5_3.id, text: 'object->property', order: 2, isCorrect: false }),
      optionRepo.create({ questionId: oeQ5_3.id, text: 'object:property', order: 3, isCorrect: true }),
      optionRepo.create({ questionId: oeQ5_3.id, text: 'object[property]', order: 4, isCorrect: false })
    ]);

    // Section 6: Advanced Professional Topics
    const openEdgeSection6 = sectionRepo.create({
      courseId: openEdgeCourse.id,
      title: 'Advanced Professional Topics',
      order: 6,
      description: 'Master enterprise-level concepts: variable scoping, include files, temp-tables, datasets, and best practices'
    });
    await sectionRepo.save(openEdgeSection6);

    await lessonRepo.save([
      lessonRepo.create({
        sectionId: openEdgeSection6.id,
        title: 'Variable Scopes and Visibility',
        content: 'Deep dive into variable scope: Block-level scope with DO blocks, procedure-level scope, internal procedure variables, parameter scope (INPUT, OUTPUT, INPUT-OUTPUT), external procedure scope, scope hierarchy, variable lifetime, and practical examples demonstrating scope conflicts and resolution. Critical for avoiding bugs in large applications.',
        type: 'text',
        duration: 35,
        order: 1
      }),
      lessonRepo.create({
        sectionId: openEdgeSection6.id,
        title: 'Include Files (.i)',
        content: 'Reusable code with include files: What are include files, creating basic .i files, using {filename.i} syntax, include files with preprocessor parameters, named parameters, include files for temp-table definitions, understanding scope issues with includes, and best practices for organization, documentation, and avoiding circular dependencies.',
        type: 'text',
        duration: 32,
        order: 2
      }),
      lessonRepo.create({
        sectionId: openEdgeSection6.id,
        title: 'Temp-Tables',
        content: 'Temporary data structures: Understanding temp-tables vs database tables, defining temp-tables with DEFINE TEMP-TABLE, using LIKE to copy database structure, creating indexes for performance, passing temp-tables as parameters with TABLE and TABLE-HANDLE, BEFORE-TABLE for change tracking, dynamic temp-tables at runtime, and temp-table arrays for complex scenarios.',
        type: 'text',
        duration: 38,
        order: 3
      }),
      lessonRepo.create({
        sectionId: openEdgeSection6.id,
        title: 'DataSets (ProDataSets)',
        content: 'Multi-table data management: Introduction to datasets, defining datasets with DEFINE DATASET, data-relation for parent-child relationships, working with dataset buffers, multiple relationships in complex hierarchies, FILL method for populating, passing datasets as parameters, nested data with grandparent-parent-child, and change tracking with BEFORE-TABLE. Perfect for order-detail-payment scenarios.',
        type: 'text',
        duration: 40,
        order: 4
      }),
      lessonRepo.create({
        sectionId: openEdgeSection6.id,
        title: 'Shared Temp-Tables and Global Variables',
        content: 'Application-wide data sharing: Understanding SHARED vs GLOBAL scope, NEW SHARED temp-tables for procedure chains, NEW GLOBAL SHARED for application-wide access, scope lifetime comparison, global variables for configuration, shared variables in procedure chains, global shared datasets, and warnings about the risks of overusing global state leading to tight coupling and maintenance issues.',
        type: 'text',
        duration: 35,
        order: 5
      }),
      lessonRepo.create({
        sectionId: openEdgeSection6.id,
        title: 'Scoped Variable Definitions',
        content: 'Advanced variable declaration: Variable scope keywords summary, NO-UNDO for local variables (performance), block-level DO scope, function and method scope, FOR EACH block scope, static variables in classes, PRIVATE and PROTECTED class members, variable scope resolution rules, and understanding shadowing when same-named variables exist in different scopes.',
        type: 'text',
        duration: 30,
        order: 6
      }),
      lessonRepo.create({
        sectionId: openEdgeSection6.id,
        title: 'Best Practices and Summary',
        content: 'Professional development guidelines: Variable scoping best practices (prefer local over global), include file organization and documentation, temp-table design for performance, dataset best practices for data integrity, avoiding global state pitfalls, example of good application structure, comprehensive summary reference table, 5 hands-on practice exercises, key takeaways, and next steps for continued learning. Prepare for building enterprise applications with confidence.',
        type: 'text',
        duration: 42,
        order: 7
      })
    ]);

    console.log('✅ OpenEdge 4GL course created successfully!');

    console.log('✅ Database seeded successfully!');
    console.log('\n==============================================');
    console.log('ALL COURSES CREATED SUCCESSFULLY!');
    console.log('==============================================');
    console.log('\nSeeded data summary:');
    console.log('- 4 users:');
    console.log('  • Admin: admin@lms.com / admin123');
    console.log('  • Student: john@lms.com / student123');
    console.log('  • Instructor: jane@lms.com / instructor123');
    console.log('  • Student: alice@lms.com / student123');
    console.log('\n- COURSE 1: ANGULAR - THE COMPLETE GUIDE');
    console.log('  ✓ 15 Comprehensive Sections');
    console.log('  ✓ 100+ Video Lessons');
    console.log('  ✓ 6 Comprehensive Quizzes');
    console.log('  ✓ Total Duration: 59 hours');
    console.log('  ✓ Topics: TypeScript, Components, Directives, Services, Routing, Forms, HTTP, NgRx, Testing, and more');
    console.log('\n- COURSE 2: REACT - THE COMPLETE GUIDE');
    console.log('  ✓ Web Development course');
    console.log('  ✓ Total Duration: 48 hours');
    console.log('\n- COURSE 3: NODE.JS - THE COMPLETE GUIDE');
    console.log('  ✓ Backend Development course');
    console.log('  ✓ Total Duration: 42 hours');
    console.log('\n- COURSE 4: OPENEDGE 4GL - INTERACTIVE COMPREHENSIVE COURSE ⭐ NEW!');
    console.log('  ✓ 6 Professional Sections');
    console.log('  ✓ 19 Comprehensive Lessons');
    console.log('  ✓ 5 Quizzes with 25+ Questions');
    console.log('  ✓ Total Duration: 50 hours (3000 minutes)');
    console.log('  ✓ Topics Covered:');
    console.log('    1. Foundations - Syntax, Variables, User Input');
    console.log('    2. Control Flow - IF/CASE statements, Loops');
    console.log('    3. Database Operations - CRUD, Transactions, Error Handling');
    console.log('    4. Modular Programming - Procedures, Functions, Forms');
    console.log('    5. Advanced Concepts - OOP, Reports, Web Services');
    console.log('    6. Professional Topics - Scoping, Include Files, Temp-Tables, DataSets');
    console.log('  ✓ 6 Real-World Projects: Calculator, Customer Management, Order Processing, and more');
    console.log('  ✓ Enterprise Best Practices included');
    console.log('\n==============================================');
    console.log('Total: 4 complete courses with comprehensive content');
    console.log('==============================================\n');

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
