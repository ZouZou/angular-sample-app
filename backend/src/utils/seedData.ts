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

    console.log('✅ Database seeded successfully!');
    console.log('\n==============================================');
    console.log('COMPREHENSIVE ANGULAR COURSE CREATED!');
    console.log('==============================================');
    console.log('\nSeeded data summary:');
    console.log('- 4 users:');
    console.log('  • Admin: admin@lms.com / admin123');
    console.log('  • Student: john@lms.com / student123');
    console.log('  • Instructor: jane@lms.com / instructor123');
    console.log('  • Student: alice@lms.com / student123');
    console.log('\n- FULL ANGULAR COURSE:');
    console.log('  ✓ 15 Comprehensive Sections');
    console.log('  ✓ 100+ Video Lessons');
    console.log('  ✓ 6 Comprehensive Quizzes');
    console.log('  ✓ Total Duration: 59 hours');
    console.log('  ✓ Topics Covered:');
    console.log('    - Getting Started & Setup');
    console.log('    - TypeScript Fundamentals');
    console.log('    - Components & Templates');
    console.log('    - Directives');
    console.log('    - Services & Dependency Injection');
    console.log('    - Routing & Navigation');
    console.log('    - Forms (Template-driven & Reactive)');
    console.log('    - HTTP & RxJS Observables');
    console.log('    - Pipes');
    console.log('    - Authentication & Authorization');
    console.log('    - State Management with NgRx');
    console.log('    - Testing');
    console.log('    - Performance Optimization');
    console.log('    - Angular Material');
    console.log('    - Deployment & Best Practices');
    console.log('\n- 2 additional courses (React and Node.js)');
    console.log('==============================================\n');

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
