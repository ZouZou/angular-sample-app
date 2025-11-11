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
        content: `### File Extensions

OpenEdge programs use these file extensions:
- \`.p\` - Procedure files (main programs)
- \`.w\` - Window files (GUI programs)
- \`.i\` - Include files (reusable code)
- \`.r\` - Compiled "r-code" files

### The Simplest Program

\`\`\`progress
/* hello.p - My first OpenEdge program */
DISPLAY "Hello, World!".
\`\`\`

**Line-by-line explanation:**
1. \`/* ... */\` - Comments (not executed)
2. \`DISPLAY\` - Built-in command to show output
3. \`"Hello, World!"\` - Text string to display
4. \`.\` - Statement terminator (CRITICAL - every statement ends with a period!)

### Key Syntax Rules

1. **Statements end with periods (.)**
   - NOT semicolons like other languages
   - Forgetting the period = syntax error

2. **Keywords are NOT case-sensitive**
   - \`DISPLAY\`, \`display\`, \`DiSpLaY\` all work
   - Convention: UPPERCASE for keywords

3. **Comments**
   - Block: \`/* comment */\`
   - Line: \`// comment\`

4. **Whitespace doesn't matter**
   - Use it for readability

### Try It Yourself! 🎯

**Exercise 1:** Display your name
\`\`\`progress
DISPLAY "My name is [Your Name]".
\`\`\`

**Exercise 2:** Multiple lines
\`\`\`progress
DISPLAY "Welcome to OpenEdge 4GL!".
DISPLAY "This is my first program.".
DISPLAY "I'm learning to code!".
\`\`\`

**Exercise 3:** Display with formatting
\`\`\`progress
DISPLAY "Name:    John Doe".
DISPLAY "Company: Acme Corp".
DISPLAY "Year:    2025".
\`\`\`

---`,
        type: 'text',
        duration: 25,
        order: 1
      }),
      lessonRepo.create({
        sectionId: openEdgeSection1.id,
        title: 'Variables and Data Types',
        content: `### What are Variables?

Variables are named containers that store data. Like labeled boxes for your information.

### Defining Variables

**Every variable MUST be defined before use:**

\`\`\`progress
DEFINE VARIABLE myName AS CHARACTER NO-UNDO.
DEFINE VARIABLE myAge AS INTEGER NO-UNDO.
DEFINE VARIABLE myHeight AS DECIMAL NO-UNDO.
DEFINE VARIABLE isStudent AS LOGICAL NO-UNDO.
\`\`\`

**Syntax breakdown:**
- \`DEFINE VARIABLE\` - Declares a variable
- \`myName\` - Variable name (your choice, no spaces)
- \`AS CHARACTER\` - Data type
- \`NO-UNDO\` - Don't track in transaction log (use for local variables)

### Common Data Types

| Data Type | Description | Example Values | Max Size |
|-----------|-------------|----------------|----------|
| **CHARACTER** | Text strings | "Hello", "ABC123" | 32,000+ chars |
| **INTEGER** | Whole numbers | 42, -10, 0 | -2,147,483,648 to 2,147,483,647 |
| **DECIMAL** | Numbers with decimals | 3.14, 99.99 | Very large range |
| **LOGICAL** | True/False | TRUE, FALSE, ? | 3 values |
| **DATE** | Calendar dates | 12/25/2025 | Dates |
| **DATETIME** | Date + time | 12/25/2025 14:30 | Date & time |
| **INT64** | Large integers | 9223372036854775807 | Very large |

### The Mystery of "?" (Unknown Value)

In OpenEdge, \`?\` represents **unknown or null**:

\`\`\`progress
DEFINE VARIABLE unknownValue AS CHARACTER NO-UNDO.
/* unknownValue is automatically ? */

IF unknownValue = ? THEN
    DISPLAY "Value is unknown".

/* You can explicitly assign ? */
unknownValue = ?.
\`\`\`

**Important:** \`?\` is different from NULL in other languages - you CAN use = and <> with it!

### Assigning Values

\`\`\`progress
DEFINE VARIABLE name AS CHARACTER NO-UNDO.
DEFINE VARIABLE age AS INTEGER NO-UNDO.

/* Method 1: Using ASSIGN (recommended for multiple) */
ASSIGN 
    name = "Alice"
    age = 25.

/* Method 2: Direct assignment */
name = "Bob".
age = 30.
\`\`\`

### Complete Example

\`\`\`progress
/* student-info.p */

/* Define variables */
DEFINE VARIABLE studentName AS CHARACTER NO-UNDO.
DEFINE VARIABLE studentAge AS INTEGER NO-UNDO.
DEFINE VARIABLE studentGPA AS DECIMAL NO-UNDO.
DEFINE VARIABLE isEnrolled AS LOGICAL NO-UNDO.

/* Assign values */
ASSIGN
    studentName = "Sarah Johnson"
    studentAge = 21
    studentGPA = 3.85
    isEnrolled = TRUE.

/* Display information */
DISPLAY 
    "Student Information:"
    "==================="
    "Name:" studentName
    "Age:" studentAge
    "GPA:" studentGPA FORMAT "9.99"
    "Enrolled:" isEnrolled.
\`\`\`

### Variable Naming Rules

- Start with a letter or underscore
- Can contain letters, numbers, underscores
- NO spaces
- NOT case-sensitive (myName = MyName = MYNAME)
- Avoid keywords (DEFINE, DISPLAY, etc.)

**Good names:** customerName, orderTotal, isActive, temp_value  
**Bad names:** 123name, my name, FOR, class

---`,
        type: 'text',
        duration: 30,
        order: 2
      }),
      lessonRepo.create({
        sectionId: openEdgeSection1.id,
        title: 'User Input and Interaction',
        content: `### Getting Input from Users

The \`UPDATE\` statement lets users enter data:

\`\`\`progress
DEFINE VARIABLE userName AS CHARACTER NO-UNDO.
DEFINE VARIABLE userAge AS INTEGER NO-UNDO.

UPDATE userName LABEL "Enter your name".
UPDATE userAge LABEL "Enter your age".

DISPLAY 
    "Hello," userName "!"
    "You are" userAge "years old.".
\`\`\`

### Formatting with LABEL

Labels make your interface clearer:

\`\`\`progress
UPDATE 
    userName LABEL "Full Name"
    userAge LABEL "Age"
    userCity LABEL "City".
\`\`\`

### Using Frames for Better Layout

Frames control how data is displayed:

\`\`\`progress
DEFINE VARIABLE productName AS CHARACTER NO-UNDO.
DEFINE VARIABLE productPrice AS DECIMAL NO-UNDO.
DEFINE VARIABLE productQty AS INTEGER NO-UNDO.

UPDATE 
    productName LABEL "Product Name"
    productPrice LABEL "Price"
    productQty LABEL "Quantity"
    WITH FRAME inputFrame SIDE-LABELS.

DEFINE VARIABLE total AS DECIMAL NO-UNDO.
total = productPrice * productQty.

DISPLAY 
    "Order Summary"
    "============="
    productName
    productPrice FORMAT "$>>>,>>9.99"
    productQty
    "Total:" total FORMAT "$>>>,>>9.99"
    WITH FRAME summaryFrame.
\`\`\`

### Message Boxes

Show alerts and get user confirmation:

\`\`\`progress
/* Simple message */
MESSAGE "Processing complete!" 
    VIEW-AS ALERT-BOX INFORMATION.

/* Confirmation dialog */
DEFINE VARIABLE userChoice AS LOGICAL NO-UNDO.

MESSAGE "Do you want to continue?" 
    VIEW-AS ALERT-BOX QUESTION 
    BUTTONS YES-NO
    UPDATE userChoice.

IF userChoice THEN
    MESSAGE "You chose Yes!" VIEW-AS ALERT-BOX.
ELSE
    MESSAGE "You chose No!" VIEW-AS ALERT-BOX.

/* Error message */
MESSAGE "An error occurred!" 
    VIEW-AS ALERT-BOX ERROR.

/* Warning message */
MESSAGE "This action cannot be undone!" 
    VIEW-AS ALERT-BOX WARNING.
\`\`\`

### Complete Interactive Calculator

\`\`\`progress
/* simple-calc.p */

DEFINE VARIABLE num1 AS DECIMAL NO-UNDO.
DEFINE VARIABLE num2 AS DECIMAL NO-UNDO.
DEFINE VARIABLE operation AS CHARACTER NO-UNDO.
DEFINE VARIABLE result AS DECIMAL NO-UNDO.
DEFINE VARIABLE errorOccurred AS LOGICAL NO-UNDO.

/* Get user input */
UPDATE 
    num1 LABEL "First Number"
    operation LABEL "Operation (+,-,*,/)"
    num2 LABEL "Second Number"
    WITH FRAME calcInput SIDE-LABELS.

/* Perform calculation */
errorOccurred = FALSE.

CASE operation:
    WHEN "+" THEN result = num1 + num2.
    WHEN "-" THEN result = num1 - num2.
    WHEN "*" THEN result = num1 * num2.
    WHEN "/" THEN DO:
        IF num2 = 0 THEN DO:
            MESSAGE "Cannot divide by zero!" 
                VIEW-AS ALERT-BOX ERROR.
            errorOccurred = TRUE.
        END.
        ELSE
            result = num1 / num2.
    END.
    OTHERWISE DO:
        MESSAGE "Invalid operation! Use +, -, *, or /" 
            VIEW-AS ALERT-BOX ERROR.
        errorOccurred = TRUE.
    END.
END CASE.

/* Display result if no error */
IF NOT errorOccurred THEN
    DISPLAY 
        num1 operation num2 "=" result FORMAT ">>>,>>9.99"
        WITH FRAME resultFrame.
\`\`\``,
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

    // Add quiz lesson to section
    await lessonRepo.save(
      lessonRepo.create({
        sectionId: openEdgeSection1.id,
        title: 'Foundations Quiz',
        description: 'Test your knowledge of OpenEdge 4GL fundamentals',
        type: 'quiz',
        duration: 15,
        order: 4,
        quizId: openEdgeQuiz1.id
      })
    );

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
        content: `### IF-THEN-ELSE Statements

Make decisions in your code:

\`\`\`progress
DEFINE VARIABLE temperature AS INTEGER NO-UNDO.
DEFINE VARIABLE advice AS CHARACTER NO-UNDO.

temperature = 75.

IF temperature > 80 THEN
    advice = "It's hot! Stay hydrated.".
ELSE IF temperature > 60 THEN
    advice = "Perfect weather!".
ELSE IF temperature > 32 THEN
    advice = "It's cold! Wear a jacket.".
ELSE
    advice = "It's freezing! Bundle up!".

DISPLAY advice.
\`\`\`

### Comparison Operators

| Operator | Meaning | Example |
|----------|---------|---------|
| \`=\` or \`EQ\` | Equal to | \`age = 25\` |
| \`<>\` or \`NE\` | Not equal | \`status <> "closed"\` |
| \`>\` or \`GT\` | Greater than | \`price > 100\` |
| \`<\` or \`LT\` | Less than | \`count < 10\` |
| \`>=\` or \`GE\` | Greater or equal | \`score >= 90\` |
| \`<=\` or \`LE\` | Less or equal | \`age <= 65\` |

### Logical Operators

Combine multiple conditions:

\`\`\`progress
DEFINE VARIABLE age AS INTEGER NO-UNDO.
DEFINE VARIABLE hasLicense AS LOGICAL NO-UNDO.
DEFINE VARIABLE hasInsurance AS LOGICAL NO-UNDO.

age = 25.
hasLicense = TRUE.
hasInsurance = TRUE.

/* AND - both must be TRUE */
IF age >= 18 AND hasLicense THEN
    DISPLAY "Eligible to drive!".

/* OR - at least one must be TRUE */
IF age < 18 OR NOT hasLicense OR NOT hasInsurance THEN
    DISPLAY "Cannot drive legally!".

/* NOT - reverses the value */
IF NOT hasInsurance THEN
    DISPLAY "You need insurance!".
\`\`\`

### CASE Statements

Better than multiple IF-ELSE for many options:

\`\`\`progress
DEFINE VARIABLE dayOfWeek AS INTEGER NO-UNDO.
DEFINE VARIABLE dayName AS CHARACTER NO-UNDO.

dayOfWeek = 3.

CASE dayOfWeek:
    WHEN 1 THEN dayName = "Monday".
    WHEN 2 THEN dayName = "Tuesday".
    WHEN 3 THEN dayName = "Wednesday".
    WHEN 4 THEN dayName = "Thursday".
    WHEN 5 THEN dayName = "Friday".
    WHEN 6 OR WHEN 7 THEN dayName = "Weekend!".
    OTHERWISE dayName = "Invalid day".
END CASE.

DISPLAY dayName.
\`\`\`

### Complex Conditions

\`\`\`progress
DEFINE VARIABLE score AS INTEGER NO-UNDO.
DEFINE VARIABLE attendance AS INTEGER NO-UNDO.
DEFINE VARIABLE grade AS CHARACTER NO-UNDO.

score = 85.
attendance = 90.

/* Multiple conditions */
IF score >= 90 AND attendance >= 80 THEN
    grade = "A - Excellent!".
ELSE IF score >= 80 AND attendance >= 70 THEN
    grade = "B - Good!".
ELSE IF score >= 70 AND attendance >= 60 THEN
    grade = "C - Satisfactory".
ELSE IF score >= 60 THEN
    grade = "D - Needs Improvement".
ELSE
    grade = "F - Failed".

DISPLAY "Final Grade:" grade.
\`\`\`

### Nested IF Statements

\`\`\`progress
DEFINE VARIABLE income AS DECIMAL NO-UNDO.
DEFINE VARIABLE dependents AS INTEGER NO-UNDO.
DEFINE VARIABLE taxRate AS DECIMAL NO-UNDO.

income = 75000.
dependents = 2.

IF income < 50000 THEN DO:
    IF dependents > 2 THEN
        taxRate = 0.10.
    ELSE
        taxRate = 0.15.
END.
ELSE IF income < 100000 THEN DO:
    IF dependents > 2 THEN
        taxRate = 0.20.
    ELSE
        taxRate = 0.25.
END.
ELSE DO:
    taxRate = 0.30.
END.

DISPLAY "Income:" income FORMAT "$>>>,>>9.99"
        "Tax Rate:" taxRate * 100 FORMAT ">>9.99" "%".
\`\`\`

---`,
        type: 'text',
        duration: 32,
        order: 1
      }),
      lessonRepo.create({
        sectionId: openEdgeSection2.id,
        title: 'Loops and Iteration',
        content: `### DO WHILE Loop

Repeats while condition is TRUE:

\`\`\`progress
DEFINE VARIABLE counter AS INTEGER NO-UNDO.

counter = 1.

DO WHILE counter <= 5:
    DISPLAY "Count:" counter.
    counter = counter + 1.
END.
\`\`\`

### DO...TO Loop

Count from one number to another:

\`\`\`progress
DEFINE VARIABLE i AS INTEGER NO-UNDO.

/* Count from 1 to 10 */
DO i = 1 TO 10:
    DISPLAY i.
END.

/* Count backwards */
DO i = 10 TO 1 BY -1:
    DISPLAY i.
END.

/* Count by 2s */
DO i = 0 TO 20 BY 2:
    DISPLAY "Even:" i.
END.

/* Count by 5s */
DO i = 5 TO 50 BY 5:
    DISPLAY "Multiple of 5:" i.
END.
\`\`\`

### REPEAT Loop

Most flexible - repeats indefinitely until LEAVE:

\`\`\`progress
DEFINE VARIABLE userInput AS CHARACTER NO-UNDO.
DEFINE VARIABLE keepGoing AS LOGICAL NO-UNDO.

keepGoing = TRUE.

REPEAT WHILE keepGoing:
    UPDATE userInput LABEL "Enter command (or 'quit')".
    
    IF userInput = "quit" THEN
        keepGoing = FALSE.  /* Exit the loop */
    ELSE
        DISPLAY "You entered:" userInput.
END.

/* Alternative with LEAVE */
REPEAT:
    UPDATE userInput LABEL "Enter command (or 'quit')".
    
    IF userInput = "quit" THEN
        LEAVE.  /* Exit immediately */
    
    DISPLAY "You entered:" userInput.
END.
\`\`\`

### NEXT Statement

Skip to next iteration:

\`\`\`progress
DEFINE VARIABLE i AS INTEGER NO-UNDO.

/* Display only odd numbers */
DO i = 1 TO 10:
    IF i MODULO 2 = 0 THEN
        NEXT.  /* Skip even numbers */
    
    DISPLAY "Odd number:" i.
END.
\`\`\`

### Nested Loops

\`\`\`progress
DEFINE VARIABLE row AS INTEGER NO-UNDO.
DEFINE VARIABLE col AS INTEGER NO-UNDO.

/* Multiplication table */
DO row = 1 TO 10:
    DO col = 1 TO 10:
        DISPLAY row "*" col "=" (row * col) FORMAT ">>>9".
    END.
    DISPLAY "". /* Blank line */
END.
\`\`\`

### Practical Loop Examples

**Example 1: Sum of Numbers**
\`\`\`progress
DEFINE VARIABLE i AS INTEGER NO-UNDO.
DEFINE VARIABLE sum AS INTEGER NO-UNDO.

sum = 0.

DO i = 1 TO 100:
    sum = sum + i.
END.

DISPLAY "Sum of 1 to 100:" sum.
/* Result: 5050 */
\`\`\`

**Example 2: Factorial Calculator**
\`\`\`progress
DEFINE VARIABLE number AS INTEGER NO-UNDO.
DEFINE VARIABLE factorial AS INTEGER NO-UNDO.
DEFINE VARIABLE i AS INTEGER NO-UNDO.

number = 5.
factorial = 1.

DO i = 1 TO number:
    factorial = factorial * i.
END.

DISPLAY "Factorial of" number "is" factorial.
/* 5! = 120 */
\`\`\`

**Example 3: FizzBuzz**
\`\`\`progress
DEFINE VARIABLE i AS INTEGER NO-UNDO.
DEFINE VARIABLE output AS CHARACTER NO-UNDO.

DO i = 1 TO 100:
    output = "".
    
    IF i MODULO 3 = 0 THEN
        output = output + "Fizz".
    
    IF i MODULO 5 = 0 THEN
        output = output + "Buzz".
    
    IF output = "" THEN
        output = STRING(i).
    
    DISPLAY output.
END.
\`\`\``,
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

    // Add quiz lesson to section
    await lessonRepo.save(
      lessonRepo.create({
        sectionId: openEdgeSection2.id,
        title: 'Control Flow Quiz',
        description: 'Test your knowledge of conditional statements and loops',
        type: 'quiz',
        duration: 15,
        order: 3,
        quizId: openEdgeQuiz2.id
      })
    );

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
        content: `### Understanding OpenEdge Database

OpenEdge has a **built-in database** - no separate setup! The database consists of:

- **Tables**: Store structured data (like Customer, Order, Product)
- **Fields**: Columns in tables (Name, Price, Date)
- **Records**: Rows of data (individual entries)
- **Indexes**: Speed up searches

### Database Connection

\`\`\`progress
/* Connect to sports2000 demo database */
CONNECT "-db sports2000 -H localhost -S 9999" NO-ERROR.

IF ERROR-STATUS:ERROR THEN
    MESSAGE "Could not connect to database!" 
        VIEW-AS ALERT-BOX ERROR.
\`\`\`

### FOR EACH - Reading All Records

Display all records from a table:

\`\`\`progress
/* Display all customers */
FOR EACH Customer NO-LOCK:
    DISPLAY 
        Customer.CustNum 
        Customer.Name 
        Customer.City
        Customer.State.
END.
\`\`\`

**Lock Types:**
- \`NO-LOCK\` - Read-only (fastest, safest for reading)
- \`EXCLUSIVE-LOCK\` - Lock for editing (one user at a time)
- \`SHARE-LOCK\` - Multiple readers, blocks writers

**ALWAYS use NO-LOCK when just reading data!**

### WHERE Clause - Filtering Records

Find specific records:

\`\`\`progress
/* Find customers in California */
FOR EACH Customer NO-LOCK
    WHERE Customer.State = "CA":
    
    DISPLAY 
        Customer.Name 
        Customer.City
        Customer.Balance FORMAT "$>>>,>>9.99".
END.
\`\`\`

### Multiple Conditions

\`\`\`progress
/* High-value California customers */
FOR EACH Customer NO-LOCK
    WHERE Customer.State = "CA"
      AND Customer.Balance > 10000:
    
    DISPLAY 
        Customer.Name 
        Customer.Balance FORMAT "$>>>,>>9.99".
END.

/* Customers in CA or NY */
FOR EACH Customer NO-LOCK
    WHERE Customer.State = "CA"
       OR Customer.State = "NY":
    
    DISPLAY Customer.Name Customer.State.
END.
\`\`\`

### FIND - Get One Specific Record

\`\`\`progress
DEFINE VARIABLE searchNum AS INTEGER NO-UNDO.

searchNum = 1.

/* Find specific customer */
FIND FIRST Customer NO-LOCK
    WHERE Customer.CustNum = searchNum
    NO-ERROR.

IF AVAILABLE Customer THEN
    DISPLAY 
        Customer.Name 
        Customer.City
        Customer.Balance FORMAT "$>>>,>>9.99".
ELSE
    MESSAGE "Customer" searchNum "not found!" 
        VIEW-AS ALERT-BOX WARNING.
\`\`\`

**Important:** Always check \`AVAILABLE TableName\` after FIND!

### Sorting Results

\`\`\`progress
/* Sort by name */
FOR EACH Customer NO-LOCK
    BY Customer.Name:
    
    DISPLAY Customer.Name Customer.City.
END.

/* Sort descending */
FOR EACH Customer NO-LOCK
    BY Customer.Balance DESCENDING:
    
    DISPLAY 
        Customer.Name 
        Customer.Balance FORMAT "$>>>,>>9.99".
END.

/* Multiple sort fields */
FOR EACH Customer NO-LOCK
    BY Customer.State
    BY Customer.Name:
    
    DISPLAY Customer.State Customer.Name.
END.
\`\`\`

### Creating Records

\`\`\`progress
/* Create new customer */
CREATE Customer.
ASSIGN
    Customer.CustNum = 999
    Customer.Name = "John Doe"
    Customer.City = "San Francisco"
    Customer.State = "CA"
    Customer.Balance = 5000.

MESSAGE "Customer created successfully!" 
    VIEW-AS ALERT-BOX INFORMATION.
\`\`\`

### Updating Records

\`\`\`progress
/* Find and update a customer */
FIND FIRST Customer EXCLUSIVE-LOCK
    WHERE Customer.CustNum = 1
    NO-ERROR.

IF AVAILABLE Customer THEN DO:
    ASSIGN Customer.Balance = Customer.Balance + 100.
    MESSAGE "Balance updated!" VIEW-AS ALERT-BOX.
END.
ELSE
    MESSAGE "Customer not found!" VIEW-AS ALERT-BOX ERROR.
\`\`\`

### Deleting Records

\`\`\`progress
/* Find and delete */
FIND FIRST Customer EXCLUSIVE-LOCK
    WHERE Customer.CustNum = 999
    NO-ERROR.

IF AVAILABLE Customer THEN DO:
    DELETE Customer.
    MESSAGE "Customer deleted!" VIEW-AS ALERT-BOX.
END.
\`\`\`

### Counting Records

\`\`\`progress
DEFINE VARIABLE customerCount AS INTEGER NO-UNDO.

/* Count all customers */
FOR EACH Customer NO-LOCK:
    customerCount = customerCount + 1.
END.

DISPLAY "Total customers:" customerCount.

/* Count with condition */
customerCount = 0.
FOR EACH Customer NO-LOCK
    WHERE Customer.State = "CA":
    customerCount = customerCount + 1.
END.

DISPLAY "California customers:" customerCount.
\`\`\`

### Calculating Totals

\`\`\`progress
DEFINE VARIABLE totalBalance AS DECIMAL NO-UNDO.

FOR EACH Customer NO-LOCK:
    totalBalance = totalBalance + Customer.Balance.
END.

DISPLAY "Total balance:" totalBalance FORMAT "$>>>,>>>,>>9.99".
\`\`\`

---`,
        type: 'text',
        duration: 40,
        order: 1
      }),
      lessonRepo.create({
        sectionId: openEdgeSection3.id,
        title: 'Transactions and Error Handling',
        content: `### What are Transactions?

A **transaction** is a group of database operations that either:
- **All succeed together**, OR
- **All fail together** (rollback)

This prevents data corruption.

**Example:** Transferring money between accounts:
- Deduct from Account A
- Add to Account B
- Both must happen, or neither should!

### Transaction Blocks

\`\`\`progress
DO TRANSACTION:
    
    /* Deduct from Account A */
    FIND FIRST Account EXCLUSIVE-LOCK
        WHERE Account.AcctNum = 123.
    ASSIGN Account.Balance = Account.Balance - 100.
    
    /* Add to Account B */
    FIND FIRST Account EXCLUSIVE-LOCK
        WHERE Account.AcctNum = 456.
    ASSIGN Account.Balance = Account.Balance + 100.
    
    MESSAGE "Transfer complete!" VIEW-AS ALERT-BOX.
    
END. /* Transaction commits here if successful */
\`\`\`

### UNDO Keyword

If an error occurs, \`UNDO\` reverses all changes:

\`\`\`progress
DO TRANSACTION:
    
    CREATE Customer.
    ASSIGN 
        Customer.CustNum = 100
        Customer.Name = "Test".
    
    /* Validate balance */
    IF Customer.Balance < 0 THEN DO:
        MESSAGE "Balance cannot be negative!" 
            VIEW-AS ALERT-BOX ERROR.
        UNDO, LEAVE.  /* Rollback transaction and exit */
    END.
    
END.
\`\`\`

### NO-ERROR and Error Checking

\`\`\`progress
/* NO-ERROR prevents automatic error display */
FIND FIRST Customer EXCLUSIVE-LOCK
    WHERE Customer.CustNum = 999
    NO-ERROR.

/* Check if error occurred */
IF ERROR-STATUS:ERROR THEN DO:
    MESSAGE "An error occurred!" 
        VIEW-AS ALERT-BOX ERROR.
    RETURN.
END.

/* Check if record found */
IF NOT AVAILABLE Customer THEN DO:
    MESSAGE "Customer not found!" 
        VIEW-AS ALERT-BOX WARNING.
    RETURN.
END.

/* Proceed with operations */
ASSIGN Customer.Name = "Updated Name".
\`\`\`

### Modern Error Handling with CATCH

Based on the official ABL documentation:

\`\`\`progress
DO TRANSACTION ON ERROR UNDO, THROW:
    
    /* Try to find and update */
    FIND FIRST Customer EXCLUSIVE-LOCK
        WHERE Customer.CustNum = 100.
    
    ASSIGN Customer.Balance = Customer.Balance + 1000.
    
    /* Handle errors */
    CATCH e AS Progress.Lang.Error:
        MESSAGE e:GetMessage(1) 
            VIEW-AS ALERT-BOX ERROR.
        UNDO, RETURN.
    END CATCH.
    
END.
\`\`\`

### Complete Error Handling Example

\`\`\`progress
/* safe-update.p */

DEFINE VARIABLE custNum AS INTEGER NO-UNDO.
DEFINE VARIABLE newBalance AS DECIMAL NO-UNDO.
DEFINE VARIABLE updateOK AS LOGICAL NO-UNDO.

/* Get input */
UPDATE 
    custNum LABEL "Customer Number"
    newBalance LABEL "New Balance"
    WITH FRAME inputFrame SIDE-LABELS.

/* Validate input */
IF newBalance < 0 THEN DO:
    MESSAGE "Balance cannot be negative!" 
        VIEW-AS ALERT-BOX ERROR.
    RETURN.
END.

/* Perform update in transaction */
updateOK = FALSE.

DO TRANSACTION ON ERROR UNDO, LEAVE:
    
    FIND FIRST Customer EXCLUSIVE-LOCK
        WHERE Customer.CustNum = custNum
        NO-ERROR.
    
    IF NOT AVAILABLE Customer THEN DO:
        MESSAGE "Customer" custNum "not found!" 
            VIEW-AS ALERT-BOX ERROR.
        UNDO, LEAVE.
    END.
    
    ASSIGN Customer.Balance = newBalance.
    updateOK = TRUE.
    
    CATCH e AS Progress.Lang.Error:
        MESSAGE "Error:" e:GetMessage(1) 
            VIEW-AS ALERT-BOX ERROR.
        UNDO, LEAVE.
    END CATCH.
    
END.

IF updateOK THEN
    MESSAGE "Balance updated successfully!" 
        VIEW-AS ALERT-BOX INFORMATION.
\`\`\`

### ROUTINE-LEVEL Error Handling

For procedures and functions (from ABL documentation):

\`\`\`progress
PROCEDURE updateCustomer:
    /* Enable routine-level error handling */
    ROUTINE-LEVEL ON ERROR UNDO, THROW.
    
    DEFINE INPUT PARAMETER custNum AS INTEGER NO-UNDO.
    DEFINE INPUT PARAMETER newName AS CHARACTER NO-UNDO.
    
    FIND FIRST Customer EXCLUSIVE-LOCK
        WHERE Customer.CustNum = custNum.
    
    ASSIGN Customer.Name = newName.
    
END PROCEDURE.
\`\`\`

### FINALLY Block

Code that ALWAYS runs (success or error):

\`\`\`progress
DEFINE VARIABLE fileHandle AS HANDLE NO-UNDO.

DO:
    /* Open file */
    /* Process data */
    
    CATCH e AS Progress.Lang.Error:
        MESSAGE "Error:" e:GetMessage(1) 
            VIEW-AS ALERT-BOX ERROR.
    END CATCH.
    
    FINALLY:
        /* Always cleanup - close file */
        IF VALID-HANDLE(fileHandle) THEN
            DELETE OBJECT fileHandle.
    END FINALLY.
    
END.
\`\`\`

# PHASE 4: MODULAR PROGRAMMING`,
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

    // Add quiz lesson to section
    await lessonRepo.save(
      lessonRepo.create({
        sectionId: openEdgeSection3.id,
        title: 'Database and Transactions Quiz',
        description: 'Test your knowledge of database operations and transactions',
        type: 'quiz',
        duration: 15,
        order: 3,
        quizId: openEdgeQuiz3.id
      })
    );

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
        content: `### Why Use Procedures and Functions?

- **Reusability**: Write once, use many times
- **Organization**: Break large programs into manageable pieces
- **Maintainability**: Fix bugs in one place
- **Readability**: Make code easier to understand

### Internal Procedures

Procedures within the same file:

\`\`\`progress
/* main-program.p */

/* Main logic */
DEFINE VARIABLE taxAmount AS DECIMAL NO-UNDO.
DEFINE VARIABLE total AS DECIMAL NO-UNDO.

total = 1000.
RUN calculateTax(INPUT total, OUTPUT taxAmount).

DISPLAY 
    "Subtotal:" total FORMAT "$>>>,>>9.99"
    "Tax:" taxAmount FORMAT "$>>>,>>9.99"
    "Total:" (total + taxAmount) FORMAT "$>>>,>>9.99".

/* Internal procedure */
PROCEDURE calculateTax:
    DEFINE INPUT PARAMETER amount AS DECIMAL NO-UNDO.
    DEFINE OUTPUT PARAMETER tax AS DECIMAL NO-UNDO.
    
    DEFINE VARIABLE taxRate AS DECIMAL NO-UNDO.
    
    taxRate = 0.08.  /* 8% tax */
    tax = amount * taxRate.
    
END PROCEDURE.
\`\`\`

### Parameter Types

Based on ABL documentation:

\`\`\`progress
/* INPUT - Pass data TO procedure */
DEFINE INPUT PARAMETER customerName AS CHARACTER NO-UNDO.

/* OUTPUT - Return data FROM procedure */
DEFINE OUTPUT PARAMETER totalAmount AS DECIMAL NO-UNDO.

/* INPUT-OUTPUT - Pass data both ways */
DEFINE INPUT-OUTPUT PARAMETER counter AS INTEGER NO-UNDO.
\`\`\`

### Complete Procedure Example

\`\`\`progress
/* order-processor.p */

DEFINE VARIABLE custNum AS INTEGER NO-UNDO.
DEFINE VARIABLE itemCount AS INTEGER NO-UNDO.
DEFINE VARIABLE orderTotal AS DECIMAL NO-UNDO.
DEFINE VARIABLE isValid AS LOGICAL NO-UNDO.

/* Get input */
UPDATE 
    custNum LABEL "Customer Number"
    itemCount LABEL "Number of Items"
    WITH FRAME inputFrame SIDE-LABELS.

/* Validate customer */
RUN validateCustomer(INPUT custNum, OUTPUT isValid).

IF NOT isValid THEN DO:
    MESSAGE "Invalid customer!" VIEW-AS ALERT-BOX ERROR.
    RETURN.
END.

/* Calculate order total */
RUN calculateOrderTotal(INPUT itemCount, OUTPUT orderTotal).

/* Apply discount if applicable */
IF orderTotal > 1000 THEN
    RUN applyDiscount(INPUT-OUTPUT orderTotal).

/* Display result */
DISPLAY 
    "Customer:" custNum
    "Items:" itemCount
    "Total:" orderTotal FORMAT "$>>>,>>9.99"
    WITH FRAME resultFrame.

/* Procedures */

PROCEDURE validateCustomer:
    DEFINE INPUT PARAMETER custNumber AS INTEGER NO-UNDO.
    DEFINE OUTPUT PARAMETER valid AS LOGICAL NO-UNDO.
    
    FIND FIRST Customer NO-LOCK
        WHERE Customer.CustNum = custNumber
        NO-ERROR.
    
    valid = AVAILABLE Customer.
    
END PROCEDURE.

PROCEDURE calculateOrderTotal:
    DEFINE INPUT PARAMETER items AS INTEGER NO-UNDO.
    DEFINE OUTPUT PARAMETER total AS DECIMAL NO-UNDO.
    
    DEFINE VARIABLE pricePerItem AS DECIMAL NO-UNDO.
    
    pricePerItem = 25.99.
    total = items * pricePerItem.
    
END PROCEDURE.

PROCEDURE applyDiscount:
    DEFINE INPUT-OUTPUT PARAMETER amount AS DECIMAL NO-UNDO.
    
    DEFINE VARIABLE discountRate AS DECIMAL NO-UNDO.
    
    discountRate = 0.10.  /* 10% discount */
    amount = amount * (1 - discountRate).
    
    MESSAGE "10% discount applied!" 
        VIEW-AS ALERT-BOX INFORMATION.
    
END PROCEDURE.
\`\`\`

### External Procedures

Call procedures from other files:

\`\`\`progress
/* In main.p */
RUN utilities/validation.p 
    (INPUT userName, OUTPUT isValid).

IF isValid THEN
    DISPLAY "Username is valid!".
\`\`\`

\`\`\`progress
/* In utilities/validation.p */
DEFINE INPUT PARAMETER inputName AS CHARACTER NO-UNDO.
DEFINE OUTPUT PARAMETER valid AS LOGICAL NO-UNDO.

/* Validate: at least 3 characters */
valid = (LENGTH(inputName) >= 3).

IF NOT valid THEN
    MESSAGE "Username must be at least 3 characters!" 
        VIEW-AS ALERT-BOX WARNING.
\`\`\`

### User-Defined Functions

Functions return a single value:

\`\`\`progress
/* Function definition */
FUNCTION calculateDiscount RETURNS DECIMAL
    (INPUT basePrice AS DECIMAL,
     INPUT discountPercent AS DECIMAL):
     
    RETURN basePrice * (discountPercent / 100).
    
END FUNCTION.

/* Using the function */
DEFINE VARIABLE originalPrice AS DECIMAL NO-UNDO.
DEFINE VARIABLE discountAmount AS DECIMAL NO-UNDO.
DEFINE VARIABLE finalPrice AS DECIMAL NO-UNDO.

originalPrice = 100.
discountAmount = calculateDiscount(originalPrice, 10).
finalPrice = originalPrice - discountAmount.

DISPLAY 
    "Original:" originalPrice FORMAT "$>>9.99"
    "Discount:" discountAmount FORMAT "$>>9.99"
    "Final:" finalPrice FORMAT "$>>9.99".
\`\`\`

### Multiple Functions Example

\`\`\`progress
/* math-utils.p */

DEFINE VARIABLE radius AS DECIMAL NO-UNDO.

radius = 5.

DISPLAY 
    "Radius:" radius
    "Area:" calculateCircleArea(radius) FORMAT ">>>,>>9.99"
    "Circumference:" calculateCircumference(radius) FORMAT ">>>,>>9.99".

/* Function: Calculate circle area */
FUNCTION calculateCircleArea RETURNS DECIMAL
    (INPUT r AS DECIMAL):
    
    DEFINE VARIABLE pi AS DECIMAL NO-UNDO.
    pi = 3.14159.
    
    RETURN pi * r * r.
    
END FUNCTION.

/* Function: Calculate circumference */
FUNCTION calculateCircumference RETURNS DECIMAL
    (INPUT r AS DECIMAL):
    
    DEFINE VARIABLE pi AS DECIMAL NO-UNDO.
    pi = 3.14159.
    
    RETURN 2 * pi * r.
    
END FUNCTION.
\`\`\`

### Best Practices for Procedures and Functions

1. **Single Responsibility**: Each procedure/function does ONE thing well
2. **Clear Names**: Use descriptive names (calculateTax, validateEmail)
3. **Document Parameters**: Comment what each parameter does
4. **Error Handling**: Handle errors within procedures
5. **Return Values**: Functions for calculations, procedures for operations

---`,
        type: 'text',
        duration: 42,
        order: 1
      }),
      lessonRepo.create({
        sectionId: openEdgeSection4.id,
        title: 'Building Data Entry Forms',
        content: `### Simple Form

\`\`\`progress
/* customer-form.p */

DEFINE VARIABLE custNum AS INTEGER NO-UNDO.
DEFINE VARIABLE custName AS CHARACTER NO-UNDO.
DEFINE VARIABLE custCity AS CHARACTER NO-UNDO.
DEFINE VARIABLE custState AS CHARACTER NO-UNDO.
DEFINE VARIABLE custBalance AS DECIMAL NO-UNDO.

/* Create form frame */
FORM
    custNum LABEL "Customer Number"
    custName LABEL "Name" FORMAT "x(30)"
    custCity LABEL "City" FORMAT "x(20)"
    custState LABEL "State" FORMAT "x(2)"
    custBalance LABEL "Balance" FORMAT "$>>>,>>9.99"
    WITH FRAME customerFrame SIDE-LABELS.

/* Get user input */
UPDATE 
    custNum
    custName
    custCity
    custState
    custBalance
    WITH FRAME customerFrame.

/* Validate and save */
DO TRANSACTION:
    CREATE Customer.
    ASSIGN
        Customer.CustNum = custNum
        Customer.Name = custName
        Customer.City = custCity
        Customer.State = custState
        Customer.Balance = custBalance.
    
    MESSAGE "Customer saved successfully!" 
        VIEW-AS ALERT-BOX INFORMATION.
END.
\`\`\`

### Form with Browse (List)

\`\`\`progress
/* customer-browse.p */

/* Define browse frame */
DEFINE BROWSE custBrowse QUERY FOR Customer
    DISPLAY
        Customer.CustNum COLUMN-LABEL "Number"
        Customer.Name COLUMN-LABEL "Name"
        Customer.City COLUMN-LABEL "City"
        Customer.State COLUMN-LABEL "ST"
        Customer.Balance COLUMN-LABEL "Balance" FORMAT "$>>>,>>9.99".

/* Display customers */
OPEN QUERY custBrowse FOR EACH Customer NO-LOCK.

ENABLE custBrowse WITH FRAME browseFrame.

WAIT-FOR CLOSE OF CURRENT-WINDOW.
\`\`\`

### Complete CRUD Form

\`\`\`progress
/* customer-manager.p */

DEFINE VARIABLE operation AS CHARACTER NO-UNDO.

/* Main menu */
REPEAT:
    
    UPDATE operation LABEL "Operation (A)dd, (E)dit, (D)elete, (Q)uit".
    
    CASE operation:
        WHEN "A" OR WHEN "a" THEN RUN addCustomer.
        WHEN "E" OR WHEN "e" THEN RUN editCustomer.
        WHEN "D" OR WHEN "d" THEN RUN deleteCustomer.
        WHEN "Q" OR WHEN "q" THEN LEAVE.
        OTHERWISE 
            MESSAGE "Invalid option!" VIEW-AS ALERT-BOX WARNING.
    END CASE.
    
END.

/* Add customer procedure */
PROCEDURE addCustomer:
    
    DEFINE VARIABLE custNum AS INTEGER NO-UNDO.
    DEFINE VARIABLE custName AS CHARACTER NO-UNDO.
    DEFINE VARIABLE custCity AS CHARACTER NO-UNDO.
    DEFINE VARIABLE custState AS CHARACTER NO-UNDO.
    
    UPDATE 
        custNum LABEL "Customer Number"
        custName LABEL "Name"
        custCity LABEL "City"
        custState LABEL "State"
        WITH FRAME addFrame SIDE-LABELS.
    
    DO TRANSACTION:
        CREATE Customer.
        ASSIGN
            Customer.CustNum = custNum
            Customer.Name = custName
            Customer.City = custCity
            Customer.State = custState.
        
        MESSAGE "Customer added!" VIEW-AS ALERT-BOX INFORMATION.
    END.
    
END PROCEDURE.

/* Edit customer procedure */
PROCEDURE editCustomer:
    
    DEFINE VARIABLE custNum AS INTEGER NO-UNDO.
    
    UPDATE custNum LABEL "Customer Number to Edit".
    
    FIND FIRST Customer EXCLUSIVE-LOCK
        WHERE Customer.CustNum = custNum
        NO-ERROR.
    
    IF NOT AVAILABLE Customer THEN DO:
        MESSAGE "Customer not found!" VIEW-AS ALERT-BOX ERROR.
        RETURN.
    END.
    
    /* Show current values and allow editing */
    UPDATE 
        Customer.Name LABEL "Name"
        Customer.City LABEL "City"
        Customer.State LABEL "State"
        Customer.Balance LABEL "Balance"
        WITH FRAME editFrame SIDE-LABELS.
    
    MESSAGE "Customer updated!" VIEW-AS ALERT-BOX INFORMATION.
    
END PROCEDURE.

/* Delete customer procedure */
PROCEDURE deleteCustomer:
    
    DEFINE VARIABLE custNum AS INTEGER NO-UNDO.
    DEFINE VARIABLE confirm AS LOGICAL NO-UNDO.
    
    UPDATE custNum LABEL "Customer Number to Delete".
    
    FIND FIRST Customer EXCLUSIVE-LOCK
        WHERE Customer.CustNum = custNum
        NO-ERROR.
    
    IF NOT AVAILABLE Customer THEN DO:
        MESSAGE "Customer not found!" VIEW-AS ALERT-BOX ERROR.
        RETURN.
    END.
    
    /* Confirm deletion */
    MESSAGE "Delete" Customer.Name "?"
        VIEW-AS ALERT-BOX QUESTION BUTTONS YES-NO
        UPDATE confirm.
    
    IF confirm THEN DO:
        DELETE Customer.
        MESSAGE "Customer deleted!" VIEW-AS ALERT-BOX INFORMATION.
    END.
    
END PROCEDURE.
\`\`\`

# PHASE 5: ADVANCED CONCEPTS`,
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

    // Add quiz lesson to section
    await lessonRepo.save(
      lessonRepo.create({
        sectionId: openEdgeSection4.id,
        title: 'Procedures and Forms Quiz',
        description: 'Test your understanding of procedures, functions, and building data entry forms',
        type: 'quiz',
        duration: 12,
        order: 3,
        quizId: openEdgeQuiz4.id
      })
    );

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
        content: `### What is OOP?

Object-Oriented Programming organizes code into **classes** (blueprints) and **objects** (instances).

**Key Concepts:**
- **Class**: Template for creating objects
- **Object**: Instance of a class
- **Properties**: Data in a class
- **Methods**: Functions in a class
- **Inheritance**: Classes inheriting from other classes

### Defining a Simple Class

\`\`\`progress
/* Customer.cls */

CLASS Customer:
    
    /* Properties */
    DEFINE PUBLIC PROPERTY CustomerNumber AS INTEGER NO-UNDO 
        GET. SET.
    
    DEFINE PUBLIC PROPERTY CustomerName AS CHARACTER NO-UNDO 
        GET. SET.
    
    DEFINE PUBLIC PROPERTY Balance AS DECIMAL NO-UNDO 
        GET. SET.
    
    /* Constructor */
    CONSTRUCTOR PUBLIC Customer():
        ASSIGN
            CustomerNumber = 0
            CustomerName = ""
            Balance = 0.
    END CONSTRUCTOR.
    
    /* Method to add to balance */
    METHOD PUBLIC VOID AddPayment(INPUT amount AS DECIMAL):
        Balance = Balance + amount.
        MESSAGE "Payment of" amount "added." VIEW-AS ALERT-BOX.
    END METHOD.
    
    /* Method to display info */
    METHOD PUBLIC VOID DisplayInfo():
        MESSAGE 
            "Customer:" CustomerName SKIP
            "Number:" CustomerNumber SKIP
            "Balance:" Balance
            VIEW-AS ALERT-BOX INFORMATION.
    END METHOD.
    
END CLASS.
\`\`\`

### Using a Class

\`\`\`progress
/* test-customer.p */

USING Progress.Lang.*.

DEFINE VARIABLE myCustomer AS CLASS Customer NO-UNDO.

/* Create instance */
myCustomer = NEW Customer().

/* Set properties */
myCustomer:CustomerNumber = 123.
myCustomer:CustomerName = "John Doe".
myCustomer:Balance = 1000.

/* Call methods */
myCustomer:AddPayment(500).
myCustomer:DisplayInfo().

/* Cleanup */
DELETE OBJECT myCustomer.
\`\`\`

### Inheritance

\`\`\`progress
/* PremiumCustomer.cls */

CLASS PremiumCustomer INHERITS Customer:
    
    /* Additional property */
    DEFINE PUBLIC PROPERTY DiscountRate AS DECIMAL NO-UNDO 
        GET. SET.
    
    /* Constructor */
    CONSTRUCTOR PUBLIC PremiumCustomer():
        SUPER().
        DiscountRate = 0.10.  /* 10% discount */
    END CONSTRUCTOR.
    
    /* Override method */
    METHOD OVERRIDE PUBLIC VOID AddPayment(INPUT amount AS DECIMAL):
        /* Apply discount */
        DEFINE VARIABLE adjustedAmount AS DECIMAL NO-UNDO.
        adjustedAmount = amount * (1 + DiscountRate).
        
        /* Call parent method */
        SUPER:AddPayment(adjustedAmount).
    END METHOD.
    
END CLASS.
\`\`\`

---`,
        type: 'text',
        duration: 38,
        order: 1
      }),
      lessonRepo.create({
        sectionId: openEdgeSection5.id,
        title: 'Reports and Queries',
        content: `### Simple Report

\`\`\`progress
/* sales-report.p */

DEFINE VARIABLE totalSales AS DECIMAL NO-UNDO.
DEFINE VARIABLE reportDate AS DATE NO-UNDO.

reportDate = TODAY.

/* Report header */
DISPLAY 
    "SALES REPORT" FORMAT "x(50)"
    "=============" FORMAT "x(50)"
    "Date:" reportDate
    "" FORMAT "x(50)"
    WITH FRAME headerFrame NO-BOX.

/* Report body */
FOR EACH Order NO-LOCK
    BY Order.OrderDate:
    
    DISPLAY 
        Order.OrderNum LABEL "Order#"
        Order.OrderDate LABEL "Date"
        Order.Customer.Name LABEL "Customer"
        Order.OrderTotal LABEL "Total" FORMAT "$>>>,>>9.99"
        WITH FRAME bodyFrame DOWN.
    
    totalSales = totalSales + Order.OrderTotal.
END.

/* Report footer */
DISPLAY 
    "" FORMAT "x(50)"
    "=============" FORMAT "x(50)"
    "Total Sales:" totalSales FORMAT "$>>>,>>>,>>9.99"
    WITH FRAME footerFrame NO-BOX.
\`\`\`

### Grouped Report

\`\`\`progress
/* sales-by-customer.p */

DEFINE VARIABLE custTotal AS DECIMAL NO-UNDO.

FOR EACH Customer NO-LOCK:
    
    custTotal = 0.
    
    DISPLAY 
        Customer.Name FORMAT "x(30)"
        WITH FRAME custFrame NO-BOX.
    
    FOR EACH Order NO-LOCK
        WHERE Order.CustNum = Customer.CustNum:
        
        DISPLAY 
            "  " Order.OrderNum 
            Order.OrderDate 
            Order.OrderTotal FORMAT "$>>>,>>9.99"
            WITH FRAME orderFrame NO-BOX.
        
        custTotal = custTotal + Order.OrderTotal.
    END.
    
    DISPLAY 
        "  Customer Total:" custTotal FORMAT "$>>>,>>9.99"
        "" FORMAT "x(50)"
        WITH FRAME custTotalFrame NO-BOX.
    
END.
\`\`\`

---`,
        type: 'text',
        duration: 35,
        order: 2
      }),
      lessonRepo.create({
        sectionId: openEdgeSection5.id,
        title: 'Web Services and Modern Integration',
        content: `### REST API Basics

OpenEdge can create and consume REST services:

\`\`\`progress
/* Simple REST service example */

DEFINE VARIABLE httpClient AS HANDLE NO-UNDO.
DEFINE VARIABLE httpResponse AS LONGCHAR NO-UNDO.

CREATE HTTP-CLIENT httpClient.

httpClient:GET("https://api.example.com/customers").

httpResponse = httpClient:RESPONSE-BODY.

DISPLAY httpResponse.

DELETE OBJECT httpClient.
\`\`\`

### JSON Handling

\`\`\`progress
USING Progress.Json.ObjectModel.*.

DEFINE VARIABLE jsonParser AS JsonParser NO-UNDO.
DEFINE VARIABLE jsonObject AS JsonObject NO-UNDO.

jsonParser = NEW JsonParser().
jsonObject = jsonParser:ParseString('{"name":"John","age":30}').

MESSAGE 
    "Name:" jsonObject:GetCharacter("name") SKIP
    "Age:" jsonObject:GetInteger("age")
    VIEW-AS ALERT-BOX.
\`\`\`

---

## 🎯 Final Quiz: Advanced Concepts

**Question 1:** What keyword creates a new object instance?
A) CREATE  
B) NEW  
C) INSTANCE  
D) MAKE  

**Question 2:** What is inheritance?
A) Copying code between files  
B) A class extending another class  
C) Sharing variables  
D) Importing libraries  

**Question 3:** How do you access a property in an object?
A) object.property  
B) object->property  
C) object:property  
D) object::property  

**Coding Challenge:** Create a simple class hierarchy:
1. Base class: BankAccount (properties: accountNumber, balance)
2. Derived class: SavingsAccount (adds: interestRate)
3. Methods: deposit, withdraw, displayInfo
4. Test program that creates both types of accounts

---

## 🚀 Next Steps

### Practice Projects

**1. Customer Management System**
- Add/edit/delete customers
- Search and filter
- Generate reports
- Transaction handling

**2. Inventory Tracker**
- Track products and quantities
- Alert on low stock
- Calculate values
- Order management

**3. Order Processing System**
- Create orders with line items
- Calculate totals and taxes
- Track order status
- Customer integration

### Resources

**Official Documentation:**
- Progress OpenEdge Documentation: https://docs.progress.com
- ABL Reference Guide (used in this tutorial!)
- Progress Community Forums

**Learning Paths:**
- Progress Education Community (free courses)
- OpenEdge Developer Certification
- Advanced OpenEdge topics

**Advanced Topics:**
- PASOE (Progress Application Server)
- Mobile development
- Cloud deployment
- Performance optimization
- Security best practices

---

## 📊 Your Complete Progress

Track your journey:

✅ **Phase 1 - Foundations**
- Lesson 1: Basic syntax ✅
- Lesson 2: Variables and data types ✅
- Lesson 3: User input ✅

✅ **Phase 2 - Control Flow**
- Lesson 4: Control structures ✅
- Lesson 5: Loops ✅

✅ **Phase 3 - Database**
- Lesson 6: Database operations ✅
- Lesson 7: Transactions and error handling ✅

✅ **Phase 4 - Modular Programming**
- Lesson 8: Procedures and functions ✅
- Lesson 9: Data entry forms ✅

✅ **Phase 5 - Advanced**
- Lesson 10: OOP ✅
- Lesson 11: Reports ✅
- Lesson 12: Web services ✅

---

## 💬 Continue Your Learning!

**What would you like to do next?**

1. **Review Lessons** - Go through any lesson again
2. **Practice Quizzes** - Test your knowledge
3. **Build Projects** - Create real applications
4. **Ask Questions** - Get help on specific topics
5. **Advanced Topics** - Dive deeper into specialized areas

Let me know how I can help you master OpenEdge 4GL! 🚀



---
---

# 🔬 MODULE 6: ADVANCED PROFESSIONAL TOPICS

**Congratulations on completing the core modules!** You now have a solid foundation in OpenEdge 4GL.

This advanced module covers professional-level concepts that separate junior developers from senior developers. These topics are essential for building enterprise-grade applications.

## Module 6 Structure:

### **Lesson 13: Variable Scopes and Visibility**
Understanding how variables work at different scope levels

### **Lesson 14: Include Files and Code Organization**  
Reusable code patterns and file management

### **Lesson 15: Temp-Tables for In-Memory Data**
High-performance data structures

### **Lesson 16: DataSets and Data Relationships**
Managing related data collections

### **Lesson 17: Shared Variables and Global Scope**
Session-wide data management

### **Lesson 18: Scoped Variable Definitions**
Advanced scope control and class variables

### **Lesson 19: Professional Best Practices**
Enterprise development standards

---`,
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
        content: `## Understanding Scope

**Scope** determines where a variable can be accessed in your program. OpenEdge has several scope levels:

### 1.1 Block-Level Scope (Local Variables)

Variables defined in a block are only visible within that block:

\`\`\`progress
/* block-scope-demo.p */

DEFINE VARIABLE outerVar AS CHARACTER NO-UNDO.
outerVar = "Outer".

DO:
    DEFINE VARIABLE innerVar AS CHARACTER NO-UNDO.
    innerVar = "Inner".
    
    DISPLAY 
        outerVar  /* Accessible - defined in outer scope */
        innerVar. /* Accessible - defined in this block */
END.

/* This will cause an error - innerVar not visible here */
/* DISPLAY innerVar. */

DISPLAY outerVar. /* Still accessible */
\`\`\`

### 1.2 Procedure-Level Scope

Variables defined at the top of a procedure are visible throughout that procedure and its internal procedures:

\`\`\`progress
/* procedure-scope.p */

/* Main procedure scope */
DEFINE VARIABLE procLevelVar AS INTEGER NO-UNDO.
procLevelVar = 100.

RUN internalProc.

DISPLAY "Main:" procLevelVar. /* Shows 200 - modified by internal proc */

/* Internal procedure */
PROCEDURE internalProc:
    /* Can access and modify procLevelVar */
    procLevelVar = procLevelVar + 100.
    
    DISPLAY "Internal:" procLevelVar.
END PROCEDURE.
\`\`\`

### 1.3 Internal Procedure Variables

Variables defined inside internal procedures are **local** to that procedure:

\`\`\`progress
/* internal-proc-scope.p */

DEFINE VARIABLE mainVar AS CHARACTER NO-UNDO.
mainVar = "Main Variable".

RUN proc1.
RUN proc2.

DISPLAY "Main:" mainVar.

PROCEDURE proc1:
    /* Local to proc1 only */
    DEFINE VARIABLE proc1Var AS CHARACTER NO-UNDO.
    proc1Var = "Proc1 Variable".
    
    /* Can access mainVar */
    DISPLAY mainVar proc1Var.
END PROCEDURE.

PROCEDURE proc2:
    /* proc1Var is NOT accessible here */
    /* DEFINE VARIABLE proc1Var would be a different variable */
    
    DEFINE VARIABLE proc2Var AS CHARACTER NO-UNDO.
    proc2Var = "Proc2 Variable".
    
    DISPLAY mainVar proc2Var.
END PROCEDURE.
\`\`\`

### 1.4 Parameter Scope in Procedures

Parameters are visible only within the procedure that defines them:

\`\`\`progress
/* parameter-scope.p */

DEFINE VARIABLE result AS INTEGER NO-UNDO.

RUN calculate(INPUT 10, INPUT 20, OUTPUT result).
DISPLAY "Result:" result.

PROCEDURE calculate:
    DEFINE INPUT PARAMETER num1 AS INTEGER NO-UNDO.
    DEFINE INPUT PARAMETER num2 AS INTEGER NO-UNDO.
    DEFINE OUTPUT PARAMETER total AS INTEGER NO-UNDO.
    
    /* num1, num2, total only visible in this procedure */
    total = num1 + num2.
    
    /* Can call other internal procedures */
    RUN helperProc(INPUT num1).
END PROCEDURE.

PROCEDURE helperProc:
    DEFINE INPUT PARAMETER value AS INTEGER NO-UNDO.
    
    /* value is separate from calculate's parameters */
    DISPLAY "Helper received:" value.
END PROCEDURE.
\`\`\`

### 1.5 External Procedure Scope

External procedures have their own separate scope:

\`\`\`progress
/* main.p */
DEFINE VARIABLE mainValue AS INTEGER NO-UNDO.
mainValue = 50.

RUN external.p (INPUT mainValue, OUTPUT mainValue).
DISPLAY "After external call:" mainValue.
\`\`\`

\`\`\`progress
/* external.p */
DEFINE INPUT PARAMETER inputVal AS INTEGER NO-UNDO.
DEFINE OUTPUT PARAMETER outputVal AS INTEGER NO-UNDO.

/* This is a completely separate scope */
DEFINE VARIABLE localVar AS INTEGER NO-UNDO.
localVar = inputVal * 2.

outputVal = localVar.
\`\`\`

### 1.6 Scope Hierarchy Diagram

\`\`\`
┌─────────────────────────────────────────┐
│ Session Scope (GLOBAL variables)       │ ← Visible everywhere
│  ┌─────────────────────────────────────┤
│  │ Procedure Scope                     │ ← Visible in entire procedure
│  │  ┌─────────────────────────────────┤
│  │  │ Internal Proc/Block Scope       │ ← Visible in block only
│  │  │  ┌─────────────────────────────┤
│  │  │  │ DO Block Scope              │ ← Most local
└──┴──┴──┴─────────────────────────────┘
\`\`\`

---`,
        type: 'text',
        duration: 35,
        order: 1
      }),
      lessonRepo.create({
        sectionId: openEdgeSection6.id,
        title: 'Include Files (.i)',
        content: `## What are Include Files?

Include files (\`.i\` extension) contain reusable code that can be inserted into multiple programs at compile time.

### 2.1 Basic Include File

\`\`\`progress
/* common-defs.i - Include file */

DEFINE VARIABLE companyName AS CHARACTER NO-UNDO INITIAL "Acme Corp".
DEFINE VARIABLE companyPhone AS CHARACTER NO-UNDO INITIAL "555-1234".
DEFINE VARIABLE taxRate AS DECIMAL NO-UNDO INITIAL 0.08.
\`\`\`

### 2.2 Using Include Files

\`\`\`progress
/* invoice.p */

/* Include the file using curly braces */
{common-defs.i}

/* Now all variables from common-defs.i are available */
DISPLAY 
    companyName 
    companyPhone
    "Tax Rate:" taxRate.
\`\`\`

### 2.3 Include Files with Parameters (Preprocessor)

Include files can accept parameters for customization:

\`\`\`progress
/* field-define.i */

/* &1 = field name, &2 = field label, &3 = data type */
DEFINE VARIABLE {1} AS {3} NO-UNDO LABEL "{2}".
\`\`\`

**Using parametrized include:**

\`\`\`progress
/* customer-form.p */

/* Creates: DEFINE VARIABLE custName AS CHARACTER NO-UNDO LABEL "Customer Name" */
{field-define.i custName "Customer Name" CHARACTER}

/* Creates: DEFINE VARIABLE custBalance AS DECIMAL NO-UNDO LABEL "Balance" */
{field-define.i custBalance "Balance" DECIMAL}

UPDATE custName custBalance.
\`\`\`

### 2.4 Advanced Include with Named Parameters

\`\`\`progress
/* form-header.i */

/* Parameters: &TITLE, &DATE_DISPLAY */

DISPLAY 
    "{&TITLE}" FORMAT "x(50)"
    "Date:" {&DATE_DISPLAY}
    SKIP(1)
    WITH FRAME headerFrame NO-BOX.
\`\`\`

**Using named parameters:**

\`\`\`progress
/* report.p */

{form-header.i &TITLE="Sales Report" &DATE_DISPLAY=TODAY}

/* Rest of report code */
\`\`\`

### 2.5 Include Files for Temp-Table Definitions

**Common pattern for temp-table definitions:**

\`\`\`progress
/* tt-customer.i */

DEFINE TEMP-TABLE ttCustomer NO-UNDO
    FIELD CustNum AS INTEGER
    FIELD CustName AS CHARACTER FORMAT "x(30)"
    FIELD City AS CHARACTER FORMAT "x(20)"
    FIELD State AS CHARACTER FORMAT "x(2)"
    FIELD Balance AS DECIMAL
    INDEX idxCustNum IS PRIMARY UNIQUE CustNum
    INDEX idxName CustName.
\`\`\`

**Using in multiple programs:**

\`\`\`progress
/* program1.p */
{tt-customer.i}

CREATE ttCustomer.
ASSIGN
    ttCustomer.CustNum = 1
    ttCustomer.CustName = "John Doe".

FOR EACH ttCustomer:
    DISPLAY ttCustomer.CustName.
END.
\`\`\`

\`\`\`progress
/* program2.p */
{tt-customer.i}

/* Same temp-table definition, different program */
RUN loadCustomers.

PROCEDURE loadCustomers:
    /* Load data into ttCustomer */
END PROCEDURE.
\`\`\`

### 2.6 Include File Scope Issues

**Problem:** Multiple includes with same variable names

\`\`\`progress
/* config1.i */
DEFINE VARIABLE setting AS CHARACTER NO-UNDO.

/* config2.i */
DEFINE VARIABLE setting AS CHARACTER NO-UNDO. /* CONFLICT! */
\`\`\`

**Solution 1: Use Different Variable Names**
\`\`\`progress
/* config1.i */
DEFINE VARIABLE config1_setting AS CHARACTER NO-UNDO.

/* config2.i */
DEFINE VARIABLE config2_setting AS CHARACTER NO-UNDO.
\`\`\`

**Solution 2: Use Conditional Preprocessor**
\`\`\`progress
/* settings.i */
&IF DEFINED(settings-included) = 0 &THEN
&GLOBAL-DEFINE settings-included

DEFINE VARIABLE appSetting AS CHARACTER NO-UNDO.

&ENDIF
\`\`\`

### 2.7 Best Practices for Include Files

1. **Use for common definitions only**
   - Constants
   - Temp-table definitions
   - Common variable sets

2. **Avoid logic in includes**
   - Don't put procedures in includes
   - Keep includes declarative

3. **Document parameters**
   \`\`\`progress
   /* my-include.i 
    * Parameters:
    *   &TABLE_NAME - Name of the temp-table
    *   &FIELD_LIST - Fields to include
    */
   \`\`\`

4. **Use unique prefixes**
   \`\`\`progress
   /* app-constants.i */
   DEFINE VARIABLE APP_NAME AS CHARACTER NO-UNDO INITIAL "MyApp".
   DEFINE VARIABLE APP_VERSION AS CHARACTER NO-UNDO INITIAL "1.0".
   \`\`\`

---`,
        type: 'text',
        duration: 32,
        order: 2
      }),
      lessonRepo.create({
        sectionId: openEdgeSection6.id,
        title: 'Temp-Tables',
        content: `## What are Temp-Tables?

**Temp-tables** (temporary tables) are in-memory data structures similar to database tables, but they exist only during program execution.

### 3.1 Basic Temp-Table Definition

\`\`\`progress
/* Define temp-table structure */
DEFINE TEMP-TABLE ttEmployee NO-UNDO
    FIELD EmpNum AS INTEGER
    FIELD EmpName AS CHARACTER FORMAT "x(30)"
    FIELD Department AS CHARACTER FORMAT "x(20)"
    FIELD Salary AS DECIMAL FORMAT ">>>,>>9.99"
    FIELD HireDate AS DATE
    INDEX idxEmpNum IS PRIMARY UNIQUE EmpNum
    INDEX idxName EmpName
    INDEX idxDept Department.

/* Create records */
CREATE ttEmployee.
ASSIGN
    ttEmployee.EmpNum = 101
    ttEmployee.EmpName = "John Smith"
    ttEmployee.Department = "Sales"
    ttEmployee.Salary = 50000
    ttEmployee.HireDate = TODAY.

CREATE ttEmployee.
ASSIGN
    ttEmployee.EmpNum = 102
    ttEmployee.EmpName = "Jane Doe"
    ttEmployee.Department = "IT"
    ttEmployee.Salary = 65000
    ttEmployee.HireDate = TODAY - 365.

/* Query temp-table */
FOR EACH ttEmployee BY EmpName:
    DISPLAY 
        ttEmployee.EmpNum
        ttEmployee.EmpName
        ttEmployee.Department
        ttEmployee.Salary.
END.
\`\`\`

### 3.2 Temp-Table with LIKE (Copy Database Structure)

\`\`\`progress
/* Create temp-table based on database table */
DEFINE TEMP-TABLE ttCustomer LIKE Customer.

/* Copy data from database */
FOR EACH Customer NO-LOCK WHERE Customer.State = "CA":
    CREATE ttCustomer.
    BUFFER-COPY Customer TO ttCustomer.
END.

/* Work with temp-table */
FOR EACH ttCustomer:
    /* Modify without affecting database */
    ttCustomer.Balance = ttCustomer.Balance * 1.10. /* 10% increase */
END.
\`\`\`

### 3.3 Temp-Table Indexes

Indexes improve query performance:

\`\`\`progress
DEFINE TEMP-TABLE ttProduct NO-UNDO
    FIELD ProductID AS INTEGER
    FIELD ProductName AS CHARACTER
    FIELD Category AS CHARACTER
    FIELD Price AS DECIMAL
    
    /* Primary index - unique, fast lookup */
    INDEX idxPrimary IS PRIMARY UNIQUE ProductID
    
    /* Secondary indexes for common queries */
    INDEX idxName ProductName
    INDEX idxCategory Category
    INDEX idxPrice DESCENDING Price  /* Descending order */
    
    /* Composite index */
    INDEX idxCategoryPrice Category Price.
\`\`\`

### 3.4 Passing Temp-Tables as Parameters

\`\`\`progress
/* main.p */

DEFINE TEMP-TABLE ttOrder NO-UNDO
    FIELD OrderNum AS INTEGER
    FIELD OrderDate AS DATE
    FIELD Total AS DECIMAL.

/* Pass by reference (default) */
RUN loadOrders(OUTPUT TABLE ttOrder).

/* Display results */
FOR EACH ttOrder:
    DISPLAY ttOrder.OrderNum ttOrder.Total.
END.

/* Calculate totals */
RUN calculateTotals(INPUT-OUTPUT TABLE ttOrder).

PROCEDURE loadOrders:
    DEFINE OUTPUT PARAMETER TABLE FOR ttOrder.
    
    /* Load data into temp-table */
    FOR EACH Order NO-LOCK:
        CREATE ttOrder.
        ASSIGN
            ttOrder.OrderNum = Order.OrderNum
            ttOrder.OrderDate = Order.OrderDate
            ttOrder.Total = Order.Total.
    END.
END PROCEDURE.

PROCEDURE calculateTotals:
    DEFINE INPUT-OUTPUT PARAMETER TABLE FOR ttOrder.
    
    /* Process temp-table data */
    FOR EACH ttOrder:
        /* Add 10% processing fee */
        ttOrder.Total = ttOrder.Total * 1.10.
    END.
END PROCEDURE.
\`\`\`

### 3.5 Temp-Table with BEFORE-TABLE (Change Tracking)

\`\`\`progress
DEFINE TEMP-TABLE ttCustomer NO-UNDO
    FIELD CustNum AS INTEGER
    FIELD Name AS CHARACTER
    FIELD Balance AS DECIMAL
    INDEX idxCust IS PRIMARY UNIQUE CustNum
    BEFORE-TABLE btCustomer. /* Stores original values */

/* Load data */
FOR EACH Customer NO-LOCK WHERE Customer.State = "NY":
    CREATE ttCustomer.
    BUFFER-COPY Customer TO ttCustomer.
END.

/* Enable tracking */
ttCustomer:TRACKING-CHANGES = TRUE.

/* Modify data */
FIND FIRST ttCustomer WHERE ttCustomer.CustNum = 1.
ttCustomer.Balance = ttCustomer.Balance + 1000.

/* Check what changed */
FOR EACH ttCustomer:
    IF ttCustomer.ROW-STATE = ROW-MODIFIED THEN DO:
        /* Find original value in BEFORE-TABLE */
        FIND btCustomer WHERE 
            ROWID(btCustomer) = ROWID(ttCustomer).
        
        DISPLAY 
            "Customer:" ttCustomer.CustNum
            "Old Balance:" btCustomer.Balance
            "New Balance:" ttCustomer.Balance.
    END.
END.
\`\`\`

### 3.6 Dynamic Temp-Tables

Create temp-tables at runtime:

\`\`\`progress
DEFINE VARIABLE hTable AS HANDLE NO-UNDO.
DEFINE VARIABLE hField AS HANDLE NO-UNDO.
DEFINE VARIABLE hBuffer AS HANDLE NO-UNDO.

/* Create temp-table dynamically */
CREATE TEMP-TABLE hTable.

/* Add fields */
hTable:ADD-NEW-FIELD("ProductID", "INTEGER").
hTable:ADD-NEW-FIELD("ProductName", "CHARACTER").
hTable:ADD-NEW-FIELD("Price", "DECIMAL").

/* Add index */
hTable:ADD-NEW-INDEX("idxPrimary", TRUE, TRUE). /* unique, primary */
hTable:ADD-INDEX-FIELD("idxPrimary", "ProductID").

/* Prepare temp-table */
hTable:TEMP-TABLE-PREPARE("ttProduct").

/* Get buffer handle */
hBuffer = hTable:DEFAULT-BUFFER-HANDLE.

/* Create record */
hBuffer:BUFFER-CREATE().
hBuffer:BUFFER-FIELD("ProductID"):BUFFER-VALUE = 1.
hBuffer:BUFFER-FIELD("ProductName"):BUFFER-VALUE = "Widget".
hBuffer:BUFFER-FIELD("Price"):BUFFER-VALUE = 9.99.

/* Query records */
FOR EACH ttProduct:
    DISPLAY ProductID ProductName Price.
END.

/* Cleanup */
DELETE OBJECT hTable.
\`\`\`

### 3.7 Temp-Table Arrays

Store multiple values in a single field:

\`\`\`progress
DEFINE TEMP-TABLE ttSales NO-UNDO
    FIELD SalesRep AS CHARACTER
    FIELD MonthlySales AS DECIMAL EXTENT 12  /* Array for 12 months */
    INDEX idxRep IS PRIMARY SalesRep.

CREATE ttSales.
ASSIGN
    ttSales.SalesRep = "John Smith"
    ttSales.MonthlySales[1] = 10000  /* January */
    ttSales.MonthlySales[2] = 12000  /* February */
    ttSales.MonthlySales[3] = 11000. /* March */

/* Access array elements */
DEFINE VARIABLE i AS INTEGER NO-UNDO.
DEFINE VARIABLE yearTotal AS DECIMAL NO-UNDO.

FOR EACH ttSales:
    yearTotal = 0.
    DO i = 1 TO 12:
        yearTotal = yearTotal + ttSales.MonthlySales[i].
    END.
    DISPLAY ttSales.SalesRep yearTotal.
END.
\`\`\`

---`,
        type: 'text',
        duration: 38,
        order: 3
      }),
      lessonRepo.create({
        sectionId: openEdgeSection6.id,
        title: 'DataSets (ProDataSets)',
        content: `## What are DataSets?

**DataSets** (ProDataSets) are collections of related temp-tables with defined relationships, similar to a relational database structure in memory.

### 4.1 Basic DataSet Definition

\`\`\`progress
/* Define temp-tables */
DEFINE TEMP-TABLE ttCustomer NO-UNDO
    FIELD CustNum AS INTEGER
    FIELD CustName AS CHARACTER
    FIELD City AS CHARACTER
    INDEX idxCust IS PRIMARY UNIQUE CustNum.

DEFINE TEMP-TABLE ttOrder NO-UNDO
    FIELD OrderNum AS INTEGER
    FIELD CustNum AS INTEGER
    FIELD OrderDate AS DATE
    FIELD Total AS DECIMAL
    INDEX idxOrder IS PRIMARY UNIQUE OrderNum
    INDEX idxCust CustNum.

/* Define dataset with relationship */
DEFINE DATASET dsCustomerOrders FOR ttCustomer, ttOrder
    DATA-RELATION relCustOrders FOR ttCustomer, ttOrder
        RELATION-FIELDS(CustNum, CustNum).
\`\`\`

### 4.2 Working with DataSets

\`\`\`progress
/* Load data into dataset */
FOR EACH Customer NO-LOCK WHERE Customer.State = "CA":
    CREATE ttCustomer.
    BUFFER-COPY Customer TO ttCustomer.
    
    /* Load related orders */
    FOR EACH Order NO-LOCK WHERE Order.CustNum = Customer.CustNum:
        CREATE ttOrder.
        BUFFER-COPY Order TO ttOrder.
    END.
END.

/* Navigate relationships */
FOR EACH ttCustomer:
    DISPLAY ttCustomer.CustName.
    
    /* Display related orders */
    FOR EACH ttOrder WHERE ttOrder.CustNum = ttCustomer.CustNum:
        DISPLAY 
            "  Order:" ttOrder.OrderNum 
            "  Total:" ttOrder.Total FORMAT "$>>>,>>9.99".
    END.
END.
\`\`\`

### 4.3 DataSet with Multiple Relationships

\`\`\`progress
/* Complex dataset structure */
DEFINE TEMP-TABLE ttCustomer NO-UNDO
    FIELD CustNum AS INTEGER
    FIELD CustName AS CHARACTER
    INDEX idxCust IS PRIMARY UNIQUE CustNum.

DEFINE TEMP-TABLE ttOrder NO-UNDO
    FIELD OrderNum AS INTEGER
    FIELD CustNum AS INTEGER
    FIELD OrderDate AS DATE
    INDEX idxOrder IS PRIMARY UNIQUE OrderNum
    INDEX idxCust CustNum.

DEFINE TEMP-TABLE ttOrderLine NO-UNDO
    FIELD OrderNum AS INTEGER
    FIELD LineNum AS INTEGER
    FIELD ItemNum AS INTEGER
    FIELD Quantity AS INTEGER
    FIELD Price AS DECIMAL
    INDEX idxLine IS PRIMARY UNIQUE OrderNum LineNum.

DEFINE TEMP-TABLE ttItem NO-UNDO
    FIELD ItemNum AS INTEGER
    FIELD ItemName AS CHARACTER
    FIELD UnitPrice AS DECIMAL
    INDEX idxItem IS PRIMARY UNIQUE ItemNum.

/* Define dataset with multiple relationships */
DEFINE DATASET dsOrderSystem FOR 
    ttCustomer, ttOrder, ttOrderLine, ttItem
    
    /* Customer -> Orders */
    DATA-RELATION relCustOrders FOR ttCustomer, ttOrder
        RELATION-FIELDS(CustNum, CustNum)
    
    /* Order -> Order Lines */
    DATA-RELATION relOrderLines FOR ttOrder, ttOrderLine
        RELATION-FIELDS(OrderNum, OrderNum)
    
    /* Item -> Order Lines */
    DATA-RELATION relItemLines FOR ttItem, ttOrderLine
        RELATION-FIELDS(ItemNum, ItemNum).
\`\`\`

### 4.4 DataSet FILL Method

Automatically populate related temp-tables:

\`\`\`progress
DEFINE DATASET dsCustomerOrders FOR ttCustomer, ttOrder
    DATA-RELATION relCustOrders FOR ttCustomer, ttOrder
        RELATION-FIELDS(CustNum, CustNum).

/* Create query for parent table */
DEFINE QUERY qCustomer FOR Customer.

/* Fill dataset - automatically loads related data */
DATASET dsCustomerOrders:FILL(
    INPUT qCustomer, 
    "WHERE Customer.State = 'CA'").

/* Now both ttCustomer and ttOrder are populated */
FOR EACH ttCustomer:
    DISPLAY ttCustomer.CustName.
END.
\`\`\`

### 4.5 Passing DataSets as Parameters

\`\`\`progress
/* main.p */

DEFINE TEMP-TABLE ttCustomer NO-UNDO
    FIELD CustNum AS INTEGER
    FIELD CustName AS CHARACTER.

DEFINE TEMP-TABLE ttOrder NO-UNDO
    FIELD OrderNum AS INTEGER
    FIELD CustNum AS INTEGER.

DEFINE DATASET dsData FOR ttCustomer, ttOrder
    DATA-RELATION rel FOR ttCustomer, ttOrder
        RELATION-FIELDS(CustNum, CustNum).

/* Pass entire dataset */
RUN loadData(OUTPUT DATASET dsData).

/* Process data */
FOR EACH ttCustomer:
    DISPLAY ttCustomer.CustName.
END.

PROCEDURE loadData:
    DEFINE OUTPUT PARAMETER DATASET FOR dsData.
    
    /* Load both temp-tables */
    FOR EACH Customer NO-LOCK:
        CREATE ttCustomer.
        BUFFER-COPY Customer TO ttCustomer.
    END.
    
    FOR EACH Order NO-LOCK:
        CREATE ttOrder.
        BUFFER-COPY Order TO ttOrder.
    END.
END PROCEDURE.
\`\`\`

### 4.6 DataSet with Nested Data

\`\`\`progress
DEFINE DATASET dsNested FOR ttParent, ttChild
    DATA-RELATION rel FOR ttParent, ttChild
        RELATION-FIELDS(ParentID, ParentID)
        NESTED. /* NESTED means child records embedded in parent */

/* When exported to XML, produces nested structure:
<ttParent>
    <ParentID>1</ParentID>
    <ttChild>
        <ChildID>1</ChildID>
        <ParentID>1</ParentID>
    </ttChild>
    <ttChild>
        <ChildID>2</ChildID>
        <ParentID>1</ParentID>
    </ttChild>
</ttParent>
*/
\`\`\`

### 4.7 DataSet Change Tracking

\`\`\`progress
/* Enable tracking for entire dataset */
DATASET dsCustomerOrders:TRACKING-CHANGES = TRUE.

/* Make changes */
FIND FIRST ttCustomer WHERE ttCustomer.CustNum = 1.
ttCustomer.CustName = "New Name".

CREATE ttOrder.
ASSIGN ttOrder.OrderNum = 999.

/* Check what changed */
FOR EACH ttCustomer:
    IF ttCustomer.ROW-STATE = ROW-MODIFIED THEN
        DISPLAY "Customer modified:" ttCustomer.CustNum.
END.

FOR EACH ttOrder:
    IF ttOrder.ROW-STATE = ROW-CREATED THEN
        DISPLAY "Order created:" ttOrder.OrderNum.
END.
\`\`\`

---`,
        type: 'text',
        duration: 40,
        order: 4
      }),
      lessonRepo.create({
        sectionId: openEdgeSection6.id,
        title: 'Shared Temp-Tables and Global Variables',
        content: `## Understanding Shared and Global Scope

### 5.1 NEW SHARED Temp-Tables

**NEW SHARED** creates a temp-table that can be shared with called procedures:

\`\`\`progress
/* main.p */

/* Define NEW SHARED - visible to this procedure and children */
DEFINE NEW SHARED TEMP-TABLE ttEmployee NO-UNDO
    FIELD EmpNum AS INTEGER
    FIELD EmpName AS CHARACTER
    INDEX idxEmp IS PRIMARY UNIQUE EmpNum.

/* Load data */
CREATE ttEmployee.
ASSIGN
    ttEmployee.EmpNum = 101
    ttEmployee.EmpName = "John Smith".

/* Call procedure that will access the shared temp-table */
RUN employee-utils.p.

/* Display results - may be modified by called procedure */
FOR EACH ttEmployee:
    DISPLAY ttEmployee.EmpNum ttEmployee.EmpName.
END.
\`\`\`

\`\`\`progress
/* employee-utils.p */

/* Define SHARED - accesses the temp-table from calling procedure */
DEFINE SHARED TEMP-TABLE ttEmployee.

/* Can now access and modify ttEmployee */
CREATE ttEmployee.
ASSIGN
    ttEmployee.EmpNum = 102
    ttEmployee.EmpName = "Jane Doe".

FOR EACH ttEmployee:
    DISPLAY "In child:" ttEmployee.EmpName.
END.
\`\`\`

### 5.2 NEW GLOBAL SHARED Temp-Tables

**NEW GLOBAL SHARED** creates a temp-table visible to the entire ABL session:

\`\`\`progress
/* startup.p */

/* Define at session level */
DEFINE NEW GLOBAL SHARED TEMP-TABLE gttConfig NO-UNDO
    FIELD ConfigKey AS CHARACTER
    FIELD ConfigValue AS CHARACTER
    INDEX idxKey IS PRIMARY UNIQUE ConfigKey.

/* Initialize configuration */
CREATE gttConfig.
ASSIGN
    gttConfig.ConfigKey = "AppName"
    gttConfig.ConfigValue = "My Application".

CREATE gttConfig.
ASSIGN
    gttConfig.ConfigKey = "Version"
    gttConfig.ConfigValue = "1.0".
\`\`\`

\`\`\`progress
/* any-program.p - Run later in session */

/* Access global temp-table */
DEFINE SHARED TEMP-TABLE gttConfig.

/* Read configuration */
FIND FIRST gttConfig WHERE gttConfig.ConfigKey = "AppName" NO-ERROR.
IF AVAILABLE gttConfig THEN
    DISPLAY "Application:" gttConfig.ConfigValue.
\`\`\`

### 5.3 Scope Lifetime Comparison

\`\`\`progress
/* Scope Lifetime Chart:

┌──────────────────────────────────────────────────────┐
│ SCOPE TYPE          │ LIFETIME          │ VISIBILITY │
├─────────────────────┼──────────────────┼────────────┤
│ Local Temp-Table    │ Procedure only    │ Procedure  │
│ NEW SHARED          │ Until proc ends   │ Proc chain │
│ NEW GLOBAL SHARED   │ Entire session    │ All procs  │
└──────────────────────────────────────────────────────┘
*/
\`\`\`

### 5.4 Global Variables

Regular variables can also be GLOBAL SHARED:

\`\`\`progress
/* config.p */

/* Define global variables */
DEFINE NEW GLOBAL SHARED VARIABLE gAppName AS CHARACTER NO-UNDO.
DEFINE NEW GLOBAL SHARED VARIABLE gUserName AS CHARACTER NO-UNDO.
DEFINE NEW GLOBAL SHARED VARIABLE gSessionDate AS DATE NO-UNDO.

/* Initialize */
ASSIGN
    gAppName = "Customer Manager"
    gUserName = USERID
    gSessionDate = TODAY.
\`\`\`

\`\`\`progress
/* report.p */

/* Access global variables */
DEFINE SHARED VARIABLE gAppName AS CHARACTER NO-UNDO.
DEFINE SHARED VARIABLE gUserName AS CHARACTER NO-UNDO.
DEFINE SHARED VARIABLE gSessionDate AS DATE NO-UNDO.

/* Use in report */
DISPLAY 
    gAppName FORMAT "x(30)"
    "User:" gUserName
    "Date:" gSessionDate
    WITH FRAME reportHeader NO-BOX.
\`\`\`

### 5.5 Shared Variables in Procedure Chain

\`\`\`progress
/* level1.p */

DEFINE NEW SHARED VARIABLE sharedVar AS INTEGER NO-UNDO.
sharedVar = 10.

RUN level2.p.

DISPLAY "After level2:" sharedVar. /* Shows 30 */
\`\`\`

\`\`\`progress
/* level2.p */

DEFINE SHARED VARIABLE sharedVar AS INTEGER NO-UNDO.
sharedVar = sharedVar + 10. /* Now 20 */

RUN level3.p.

DISPLAY "After level3:" sharedVar. /* Shows 30 */
\`\`\`

\`\`\`progress
/* level3.p */

DEFINE SHARED VARIABLE sharedVar AS INTEGER NO-UNDO.
sharedVar = sharedVar + 10. /* Now 30 */

DISPLAY "In level3:" sharedVar.
\`\`\`

### 5.6 Global Shared DataSets

\`\`\`progress
/* data-manager.p */

DEFINE NEW GLOBAL SHARED TEMP-TABLE gttCustomer NO-UNDO
    FIELD CustNum AS INTEGER
    FIELD CustName AS CHARACTER.

DEFINE NEW GLOBAL SHARED TEMP-TABLE gttOrder NO-UNDO
    FIELD OrderNum AS INTEGER
    FIELD CustNum AS INTEGER.

DEFINE NEW GLOBAL SHARED DATASET gdsData FOR gttCustomer, gttOrder
    DATA-RELATION rel FOR gttCustomer, gttOrder
        RELATION-FIELDS(CustNum, CustNum).

/* Load initial data */
RUN loadInitialData.
\`\`\`

\`\`\`progress
/* report-generator.p */

DEFINE SHARED TEMP-TABLE gttCustomer.
DEFINE SHARED TEMP-TABLE gttOrder.
DEFINE SHARED DATASET gdsData FOR gttCustomer, gttOrder.

/* Access global dataset */
FOR EACH gttCustomer:
    DISPLAY gttCustomer.CustName.
    FOR EACH gttOrder WHERE gttOrder.CustNum = gttCustomer.CustNum:
        DISPLAY "  " gttOrder.OrderNum.
    END.
END.
\`\`\`

### 5.7 Warning: Risks of Global Variables

\`\`\`progress
/*
⚠️  CAUTION WITH GLOBAL VARIABLES:

1. **Hard to Track**: Changes can happen anywhere in session
2. **Testing Difficult**: State persists across tests
3. **Memory Leaks**: Not released until session ends
4. **Naming Conflicts**: Same name in different contexts
5. **Debugging Harder**: Where was value changed?

✅ BETTER ALTERNATIVES:
- Pass parameters explicitly
- Use session objects
- Encapsulate in classes
- Document clearly when used
*/
\`\`\`

---`,
        type: 'text',
        duration: 35,
        order: 5
      }),
      lessonRepo.create({
        sectionId: openEdgeSection6.id,
        title: 'Scoped Variable Definitions',
        content: `## Variable Scope Keywords

### 6.1 NO-UNDO (Always Use for Local Variables)

\`\`\`progress
/* NO-UNDO means variable won't be tracked in transactions */
DEFINE VARIABLE localVar AS INTEGER NO-UNDO.

/* Without NO-UNDO, variable is transaction-aware */
DEFINE VARIABLE txnVar AS INTEGER. /* Slower, uses more memory */

/* Best Practice: ALWAYS use NO-UNDO for local variables */
\`\`\`

### 6.2 Block-Level DO Scope

\`\`\`progress
DEFINE VARIABLE outerCount AS INTEGER NO-UNDO.

DO:
    DEFINE VARIABLE innerCount AS INTEGER NO-UNDO.
    innerCount = 10.
    outerCount = 20.
END.

/* innerCount not accessible here */
DISPLAY outerCount. /* OK */
\`\`\`

### 6.3 Function and Method Scope

\`\`\`progress
FUNCTION calculateBonus RETURNS DECIMAL
    (INPUT salary AS DECIMAL):
    
    /* Local to this function */
    DEFINE VARIABLE bonusRate AS DECIMAL NO-UNDO.
    DEFINE VARIABLE bonus AS DECIMAL NO-UNDO.
    
    bonusRate = 0.10.
    bonus = salary * bonusRate.
    
    RETURN bonus.
    
END FUNCTION.

/* bonusRate and bonus not accessible here */
\`\`\`

### 6.4 FOR EACH Block Scope

\`\`\`progress
/* Variables defined in FOR EACH are local to the loop */
FOR EACH Customer NO-LOCK:
    DEFINE VARIABLE orderCount AS INTEGER NO-UNDO.
    
    /* Count orders for this customer */
    FOR EACH Order NO-LOCK WHERE Order.CustNum = Customer.CustNum:
        orderCount = orderCount + 1.
    END.
    
    DISPLAY Customer.Name orderCount.
END.

/* orderCount not accessible here */
\`\`\`

### 6.5 Static Variables in Classes

\`\`\`progress
CLASS Employee:
    
    /* Static - shared across all instances */
    DEFINE STATIC VARIABLE totalEmployees AS INTEGER NO-UNDO.
    
    /* Instance - separate for each object */
    DEFINE VARIABLE employeeID AS INTEGER NO-UNDO.
    DEFINE VARIABLE employeeName AS CHARACTER NO-UNDO.
    
    CONSTRUCTOR Employee(INPUT empID AS INTEGER, INPUT empName AS CHARACTER):
        employeeID = empID.
        employeeName = empName.
        
        /* Increment shared counter */
        totalEmployees = totalEmployees + 1.
    END CONSTRUCTOR.
    
    METHOD PUBLIC CHARACTER GetName():
        RETURN employeeName.
    END METHOD.
    
    METHOD PUBLIC STATIC INTEGER GetTotalEmployees():
        RETURN totalEmployees.
    END METHOD.
    
END CLASS.
\`\`\`

### 6.6 PRIVATE and PROTECTED in Classes

\`\`\`progress
CLASS BankAccount:
    
    /* Private - only accessible within this class */
    DEFINE PRIVATE VARIABLE accountBalance AS DECIMAL NO-UNDO.
    
    /* Protected - accessible in this class and subclasses */
    DEFINE PROTECTED VARIABLE accountType AS CHARACTER NO-UNDO.
    
    /* Public - accessible from anywhere */
    DEFINE PUBLIC PROPERTY AccountNumber AS INTEGER NO-UNDO
        GET. SET.
    
    METHOD PUBLIC VOID Deposit(INPUT amount AS DECIMAL):
        accountBalance = accountBalance + amount.
    END METHOD.
    
    METHOD PUBLIC DECIMAL GetBalance():
        RETURN accountBalance.
    END METHOD.
    
END CLASS.
\`\`\`

### 6.7 Variable Scope Resolution

When same name exists at multiple levels, innermost scope wins:

\`\`\`progress
DEFINE VARIABLE myVar AS CHARACTER NO-UNDO.
myVar = "Outer".

DO:
    DEFINE VARIABLE myVar AS CHARACTER NO-UNDO.
    myVar = "Inner".
    DISPLAY myVar. /* Shows "Inner" */
END.

DISPLAY myVar. /* Shows "Outer" */
\`\`\`

---`,
        type: 'text',
        duration: 30,
        order: 6
      }),
      lessonRepo.create({
        sectionId: openEdgeSection6.id,
        title: 'Best Practices and Summary',
        content: `## 7.1 Variable Scoping Best Practices

✅ **DO:**
- Use most restrictive scope possible
- Use NO-UNDO for all local variables
- Define variables close to where used
- Use descriptive names to avoid conflicts
- Document shared variables clearly

❌ **DON'T:**
- Use GLOBAL SHARED unless absolutely necessary
- Define variables at procedure level if only used in internal proc
- Use same variable names at different scope levels
- Forget NO-UNDO (causes performance issues)

## 7.2 Include File Best Practices

✅ **DO:**
- Use for common definitions only
- Include guards to prevent double-inclusion
- Document parameters clearly
- Keep includes declarative (no logic)
- Version control include files

❌ **DON'T:**
- Put procedures in includes
- Circular includes
- Overuse - prefer parameters
- Duplicate variable names across includes

## 7.3 Temp-Table Best Practices

✅ **DO:**
- Always define indexes for lookup fields
- Use NO-UNDO in definition
- Use LIKE for database-based temp-tables
- Document temp-table purpose
- Clean up when done (especially dynamic)

❌ **DON'T:**
- Forget indexes (kills performance)
- Leave large temp-tables in memory
- Use temp-tables as global variables
- Ignore buffer management

## 7.4 DataSet Best Practices

✅ **DO:**
- Use for related data structures
- Define relationships clearly
- Enable tracking when needed
- Document dataset structure
- Use FILL for automatic population

❌ **DON'T:**
- Use for simple single-table operations
- Forget to define indexes on relation fields
- Leave tracking on when not needed
- Nest too deeply (performance)

## 7.5 Shared Variables Best Practices

✅ **DO:**
- Document why sharing is needed
- Use descriptive global names (g prefix)
- Minimize global variable count
- Consider alternatives first
- Clean up when done

❌ **DON'T:**
- Default to global variables
- Use for simple data passing
- Forget thread-safety concerns
- Leave unused global variables

## 7.6 Example: Good Structure

\`\`\`progress
/* order-processor.p
 * Processes customer orders
 * Dependencies: customer-tt.i, order-utils.p
 */

/* Include definitions */
{customer-tt.i}
{order-tt.i}

/* Local dataset */
DEFINE TEMP-TABLE ttOrderLine NO-UNDO
    FIELD OrderNum AS INTEGER
    FIELD LineNum AS INTEGER
    FIELD ItemNum AS INTEGER
    FIELD Quantity AS INTEGER
    FIELD Price AS DECIMAL
    INDEX idxLine IS PRIMARY UNIQUE OrderNum LineNum.

DEFINE DATASET dsOrder FOR ttOrder, ttOrderLine
    DATA-RELATION relLines FOR ttOrder, ttOrderLine
        RELATION-FIELDS(OrderNum, OrderNum).

/* Main processing */
RUN loadOrders(INPUT 1, OUTPUT DATASET dsOrder).
RUN calculateTotals(INPUT-OUTPUT DATASET dsOrder).
RUN saveOrders(INPUT DATASET dsOrder).

/* Internal procedures with clear scope */
PROCEDURE loadOrders:
    DEFINE INPUT PARAMETER custNum AS INTEGER NO-UNDO.
    DEFINE OUTPUT PARAMETER DATASET FOR dsOrder.
    
    /* Load logic here */
END PROCEDURE.

PROCEDURE calculateTotals:
    DEFINE INPUT-OUTPUT PARAMETER DATASET FOR dsOrder.
    
    /* Calculation logic here */
END PROCEDURE.

PROCEDURE saveOrders:
    DEFINE INPUT PARAMETER DATASET FOR dsOrder.
    
    /* Save logic here */
END PROCEDURE.
\`\`\`

---

## 📚 Summary Reference Table

| **Concept** | **Keyword** | **Scope** | **Use Case** |
|-------------|-------------|-----------|--------------|
| Local Variable | \`DEFINE VARIABLE\` | Block/Procedure | Most common |
| Shared Variable | \`DEFINE NEW SHARED\` | Procedure chain | Pass to children |
| Global Variable | \`DEFINE NEW GLOBAL SHARED\` | Session | Rare, session-wide data |
| Temp-Table | \`DEFINE TEMP-TABLE\` | Procedure | In-memory data |
| Shared TT | \`DEFINE NEW SHARED TEMP-TABLE\` | Procedure chain | Share with children |
| Global TT | \`DEFINE NEW GLOBAL SHARED TEMP-TABLE\` | Session | Session-wide data |
| DataSet | \`DEFINE DATASET\` | Procedure | Related temp-tables |
| Include File | \`{file.i}\` | Compile-time | Reusable definitions |
| Static Class Var | \`DEFINE STATIC\` | Class/Session | Shared across instances |
| Private Class Var | \`DEFINE PRIVATE\` | Class | Internal only |
| Protected Class Var | \`DEFINE PROTECTED\` | Class hierarchy | Subclass access |

---

## 🎯 Practice Exercises

### Exercise 1: Variable Scopes
Create a program with three levels of variable scope and demonstrate which variables are visible where.

### Exercise 2: Include Files
Create an include file for a temp-table definition and use it in two different programs.

### Exercise 3: Temp-Tables
Build a temp-table with at least 3 indexes and populate it with sample data.

### Exercise 4: DataSets
Create a dataset with 3 related temp-tables (e.g., Customer -> Order -> OrderLine).

### Exercise 5: Shared Data
Implement a configuration system using GLOBAL SHARED variables.

---

## 💡 Key Takeaways

1. **Scope matters** - Use the most restrictive scope needed
2. **NO-UNDO always** - For local variables, performance matters
3. **Include files** - Great for definitions, bad for logic
4. **Temp-tables** - Powerful in-memory data structures
5. **DataSets** - Perfect for related data collections
6. **Global carefully** - Use sparingly, document thoroughly
7. **Shared vs Parameters** - Prefer explicit parameters when possible

---

## 🚀 Next Steps

You now have comprehensive knowledge of:
- ✅ Variable scoping at all levels
- ✅ Include file usage and best practices
- ✅ Temp-table creation and manipulation
- ✅ DataSet relationships and operations
- ✅ Shared and global scope management
- ✅ Scoped variable definitions

Ready to apply this knowledge? Try building a complete application using temp-tables, datasets, and proper scoping!



---

## 🎯 CAPSTONE PROJECT: Enterprise Order Management System

Build a complete application integrating everything you've learned.

### Project Requirements:

#### Phase 1: Database Design
- Customer table with SHARED temp-table
- Order and OrderLine tables  
- Product inventory with DataSet
- Transaction logging

#### Phase 2: Core Functionality
- Customer CRUD with proper scoping
- Order entry with temp-tables
- Inventory management
- Transaction handling with full error recovery

#### Phase 3: Advanced Features
- Include files for common definitions
- Shared temp-tables across modules
- DataSets for complex queries
- Comprehensive error handling

#### Phase 4: Reporting
- Customer summary reports
- Sales analysis with datasets
- Inventory status reports
- Audit trail reports

### Deliverables:
1. Complete working application
2. Include files for reusable code
3. Documentation of scope decisions
4. Error handling strategy document
5. Test plan with results

### Evaluation Criteria:
- ✅ Proper variable scoping throughout
- ✅ Effective use of include files
- ✅ Temp-tables for performance
- ✅ DataSets for related data
- ✅ Appropriate use of shared vs. local
- ✅ Robust error handling
- ✅ Professional code organization
- ✅ Complete documentation

---

## 🎓 FINAL ASSESSMENT

### Comprehensive Exam

**Section A: Foundations (20 questions)**
Covers Modules 1-2: Basic syntax, variables, control flow, loops

**Section B: Database Operations (20 questions)**  
Covers Module 3: Reading, writing, transactions, error handling

**Section C: Modular Programming (15 questions)**
Covers Module 4: Procedures, functions, forms

**Section D: Advanced Concepts (15 questions)**
Covers Module 5: OOP, reports, web services  

**Section E: Professional Topics (30 questions)**
Covers Module 6: Scopes, includes, temp-tables, datasets, best practices

**Total: 100 questions**

**Passing Score: 70% (70/100)**

**Certificate Levels:**
- 90-100: **OpenEdge Expert** ⭐⭐⭐
- 80-89: **OpenEdge Professional** ⭐⭐
- 70-79: **OpenEdge Practitioner** ⭐

---

## 📚 Additional Resources

### Official Documentation
- [Progress OpenEdge Documentation](https://docs.progress.com)
- [ABL Language Reference](https://docs.progress.com/bundle/abl-reference)
- [Progress Community Forums](https://community.progress.com)

### Practice Databases
- sports2000 (demo database included with OpenEdge)
- Sample business databases from Progress

### Certification
- Progress OpenEdge Developer Certification
- Progress Education Community courses

### Books
- "OpenEdge Development: Progress 4GL Handbook" by John Sadd
- Progress OpenEdge official documentation

### Online Communities
- ProgressTalk.com forums
- Stack Overflow (openedge, progress-4gl tags)
- Progress Community Portal

---

## 🎯 Your Learning Path Summary

### ✅ What You've Learned:

**Module 1: Foundations**
- Basic syntax and program structure
- Variables and all data types
- User input and interaction
- Understanding the "?" value

**Module 2: Control Flow**
- IF-THEN-ELSE decision making
- CASE statements for multiple conditions
- All loop types (DO WHILE, DO...TO, REPEAT)
- Loop control with LEAVE and NEXT

**Module 3: Database Mastery**
- FOR EACH for reading records
- FIND for specific records
- Create, Update, Delete operations
- Proper locking strategies
- Transactions and UNDO
- Modern error handling with CATCH

**Module 4: Modular Programming**
- Internal and external procedures
- User-defined functions
- Parameter types (INPUT, OUTPUT, INPUT-OUTPUT)
- Building data entry forms
- Complete CRUD applications

**Module 5: Advanced Structures**
- Object-oriented programming basics
- Class definitions and inheritance
- Complex reporting and queries
- Web services and REST APIs
- JSON handling

**Module 6: Professional Topics**
- Variable scope at all levels (block, procedure, session)
- Include files for code reuse
- Temp-tables for in-memory data
- DataSets for related data structures
- Shared and global variables
- Scoped definitions (PRIVATE, PROTECTED, STATIC)
- Enterprise best practices

---

## 🚀 Next Steps After This Course

### Career Paths:
1. **OpenEdge Application Developer**
   - Build and maintain business applications
   - Enhance existing systems
   - Typical salary: $70,000-lessonRepo.create({
        sectionId: openEdgeSection6.id,
        title: 'Best Practices and Summary',
        content: 10,000

2. **OpenEdge Database Administrator**
   - Manage databases and performance
   - Backup and recovery
   - Typical salary: $75,000-lessonRepo.create({
        sectionId: openEdgeSection6.id,
        title: 'Best Practices and Summary',
        content: 20,000

3. **OpenEdge Architect**
   - Design enterprise solutions
   - Lead development teams
   - Typical salary: lessonRepo.create({
        sectionId: openEdgeSection6.id,
        title: 'Best Practices and Summary',
        content: 00,000-lessonRepo.create({
        sectionId: openEdgeSection6.id,
        title: 'Best Practices and Summary',
        content: 50,000+

### Continuing Education:
- **Advanced OpenEdge Courses**: PASOE, Mobile, Cloud
- **Specialized Topics**: Performance tuning, Security
- **Integration**: Web services, REST APIs, External systems
- **Modern UI**: Build responsive interfaces

### Join the Community:
- Contribute to open-source OpenEdge projects
- Answer questions on ProgressTalk
- Share your knowledge and experiences
- Network with other developers

---

## 💬 Course Feedback & Support

### How Did We Do?

This course was designed with the Interactive Tutor methodology to provide:
- Progressive complexity
- Multi-modal learning (explanations, examples, practice, assessments)
- Adaptive teaching based on quiz performance
- Real-world applications
- Comprehensive coverage

### Need More Help?

If you need clarification on any topic:
1. Review the relevant lesson
2. Try the practice exercises again
3. Check the quiz explanations
4. Consult the official documentation
5. Ask in OpenEdge communities

### Share Your Success!

Completed the course? Great! Share your achievement:
- LinkedIn profile update
- Progress Community profile
- Connect with other OpenEdge developers
- Consider mentoring new learners

---

## 🎉 Congratulations!

**You've completed the comprehensive OpenEdge 4GL course!**

You now have:
✅ Solid understanding of OpenEdge 4GL fundamentals
✅ Database operation expertise
✅ Ability to build complete applications
✅ Knowledge of advanced professional topics
✅ Best practices for enterprise development
✅ Foundation for specialized topics

**You're ready to:**
- Build production-quality applications
- Maintain existing enterprise systems
- Join development teams confidently
- Continue learning advanced topics
- Pursue OpenEdge certification

### Final Words:

OpenEdge 4GL is a powerful language that has stood the test of time. The skills you've learned here will serve you well in building robust, business-critical applications. 

Remember:
- Practice regularly to solidify your knowledge
- Build real projects to gain experience
- Stay connected with the community
- Keep learning and growing
- Share your knowledge with others

**Thank you for choosing this course. Best of luck in your OpenEdge development journey!** 🚀

---

## 📖 Appendix: Quick Reference

### Common Patterns

**Safe Database Read:**
\`\`\`progress
FIND FIRST TableName NO-LOCK
    WHERE TableName.KeyField = value
    NO-ERROR.
IF AVAILABLE TableName THEN
    /* Process record */
ELSE
    /* Handle not found */
\`\`\`

**Safe Database Update:**
\`\`\`progress
DO TRANSACTION ON ERROR UNDO, THROW:
    FIND FIRST TableName EXCLUSIVE-LOCK
        WHERE TableName.KeyField = value
        NO-ERROR.
    IF AVAILABLE TableName THEN
        ASSIGN TableName.Field = newValue.
    CATCH e AS Progress.Lang.Error:
        MESSAGE e:GetMessage(1) VIEW-AS ALERT-BOX ERROR.
        UNDO, RETURN.
    END CATCH.
END.
\`\`\`

**Temp-Table Definition:**
\`\`\`progress
DEFINE TEMP-TABLE ttName NO-UNDO
    FIELD Field1 AS DataType
    FIELD Field2 AS DataType
    INDEX idx1 IS PRIMARY UNIQUE Field1
    INDEX idx2 Field2.
\`\`\`

**DataSet Definition:**
\`\`\`progress
DEFINE DATASET dsName FOR ttTable1, ttTable2
    DATA-RELATION rel FOR ttTable1, ttTable2
        RELATION-FIELDS(KeyField, KeyField).
\`\`\`

**Include File Usage:**
\`\`\`progress
{include-file.i}
{include-file.i &Param1="value1" &Param2="value2"}
\`\`\`

### Keyboard Shortcuts

**Development Environment:**
- F2: Check syntax
- F3: Compile
- F5: Run
- F9: Toggle breakpoint
- Ctrl+Space: Auto-complete

### File Naming Conventions

- \`main.p\` - Main program
- \`utils.p\` - Utility procedures
- \`customer-crud.p\` - Customer CRUD operations
- \`definitions.i\` - Common definitions
- \`tt-customer.i\` - Temp-table definitions
- \`Customer.cls\` - Customer class

---

*Course Version: 2.0*  
*Last Updated: November 2025*  
*Based on OpenEdge 12.x*

**End of Course** 🎓`,
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
