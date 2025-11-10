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

    // Course 1: Angular Complete Guide
    const angularCourse = courseRepo.create({
      title: 'Angular - The Complete Guide',
      description: 'Master Angular 20 and build awesome, reactive web apps with the successor of Angular.js',
      instructor: 'Maximilian Schwarzmüller',
      duration: 2340,
      price: 84.99,
      category: 'Development',
      level: 'Intermediate',
      thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop',
      bannerUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&h=400&fit=crop',
      enrollmentCount: 1247,
      rating: 4.7
    });
    await courseRepo.save(angularCourse);

    // Angular Course - Section 1
    const angularSection1 = sectionRepo.create({
      courseId: angularCourse.id,
      title: 'Getting Started',
      order: 1,
      description: 'Learn the basics of Angular and set up your development environment'
    });
    await sectionRepo.save(angularSection1);

    const angularLesson1 = lessonRepo.create({
      sectionId: angularSection1.id,
      title: 'Welcome to Angular',
      content: 'Introduction to Angular framework and what you will learn in this course.',
      type: 'video',
      duration: 10,
      order: 1,
      videoUrl: 'https://example.com/videos/angular-intro.mp4'
    });
    await lessonRepo.save(angularLesson1);

    const angularLesson2 = lessonRepo.create({
      sectionId: angularSection1.id,
      title: 'Setting Up Development Environment',
      content: 'Install Node.js, npm, and Angular CLI to start developing Angular applications.',
      type: 'video',
      duration: 15,
      order: 2,
      videoUrl: 'https://example.com/videos/angular-setup.mp4'
    });
    await lessonRepo.save(angularLesson2);

    // Angular Course - Section 2
    const angularSection2 = sectionRepo.create({
      courseId: angularCourse.id,
      title: 'Components and Templates',
      order: 2,
      description: 'Deep dive into Angular components and template syntax'
    });
    await sectionRepo.save(angularSection2);

    const angularLesson3 = lessonRepo.create({
      sectionId: angularSection2.id,
      title: 'Understanding Components',
      content: 'Learn how to create and use Angular components effectively.',
      type: 'video',
      duration: 20,
      order: 1,
      videoUrl: 'https://example.com/videos/components.mp4'
    });
    await lessonRepo.save(angularLesson3);

    // Angular Quiz
    const angularQuiz = quizRepo.create({
      courseId: angularCourse.id,
      title: 'Angular Basics Quiz',
      description: 'Test your understanding of Angular fundamentals',
      passingScore: 70,
      timeLimit: 30
    });
    await quizRepo.save(angularQuiz);

    const angularQ1 = questionRepo.create({
      quizId: angularQuiz.id,
      question: 'What is Angular?',
      type: 'multiple-choice',
      points: 10,
      order: 1
    });
    await questionRepo.save(angularQ1);

    await optionRepo.save([
      optionRepo.create({ questionId: angularQ1.id, text: 'A JavaScript library', order: 1, isCorrect: false }),
      optionRepo.create({ questionId: angularQ1.id, text: 'A TypeScript-based web framework', order: 2, isCorrect: true }),
      optionRepo.create({ questionId: angularQ1.id, text: 'A CSS framework', order: 3, isCorrect: false }),
      optionRepo.create({ questionId: angularQ1.id, text: 'A database', order: 4, isCorrect: false })
    ]);

    // Course 2: React Complete Guide
    const reactCourse = courseRepo.create({
      title: 'React - The Complete Guide',
      description: 'Dive in and learn React.js from scratch! Learn React, Hooks, Redux, React Router, Next.js, Best Practices and way more!',
      instructor: 'Maximilian Schwarzmüller',
      duration: 2880,
      price: 89.99,
      category: 'Development',
      level: 'Beginner',
      thumbnailUrl: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=400&h=250&fit=crop',
      bannerUrl: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=1200&h=400&fit=crop',
      enrollmentCount: 2156,
      rating: 4.8
    });
    await courseRepo.save(reactCourse);

    const reactSection1 = sectionRepo.create({
      courseId: reactCourse.id,
      title: 'Getting Started with React',
      order: 1,
      description: 'Learn React fundamentals and create your first React app'
    });
    await sectionRepo.save(reactSection1);

    const reactLesson1 = lessonRepo.create({
      sectionId: reactSection1.id,
      title: 'What is React?',
      content: 'Introduction to React and its core concepts.',
      type: 'video',
      duration: 12,
      order: 1,
      videoUrl: 'https://example.com/videos/react-intro.mp4'
    });
    await lessonRepo.save(reactLesson1);

    // Course 3: Node.js Complete Guide
    const nodeCourse = courseRepo.create({
      title: 'Node.js - The Complete Guide',
      description: 'Master Node JS & Deno.js, build REST APIs with Node.js, GraphQL APIs, add Authentication, use MongoDB, SQL & much more!',
      instructor: 'Maximilian Schwarzmüller',
      duration: 2520,
      price: 94.99,
      category: 'Development',
      level: 'Intermediate',
      thumbnailUrl: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=250&fit=crop',
      bannerUrl: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=1200&h=400&fit=crop',
      enrollmentCount: 892,
      rating: 4.6
    });
    await courseRepo.save(nodeCourse);

    const nodeSection1 = sectionRepo.create({
      courseId: nodeCourse.id,
      title: 'Introduction to Node.js',
      order: 1,
      description: 'Understanding Node.js and server-side JavaScript'
    });
    await sectionRepo.save(nodeSection1);

    const nodeLesson1 = lessonRepo.create({
      sectionId: nodeSection1.id,
      title: 'What is Node.js?',
      content: 'Learn what Node.js is and how it enables JavaScript on the server.',
      type: 'video',
      duration: 15,
      order: 1,
      videoUrl: 'https://example.com/videos/node-intro.mp4'
    });
    await lessonRepo.save(nodeLesson1);

    // Course 4: Python for Data Science
    const pythonCourse = courseRepo.create({
      title: 'Python for Data Science and Machine Learning',
      description: 'Learn how to use NumPy, Pandas, Seaborn, Matplotlib, Plotly, Scikit-Learn, Machine Learning, Tensorflow, and more!',
      instructor: 'Jose Portilla',
      duration: 1620,
      price: 79.99,
      category: 'Data Science',
      level: 'Intermediate',
      thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=250&fit=crop',
      bannerUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&h=400&fit=crop',
      enrollmentCount: 1543,
      rating: 4.7
    });
    await courseRepo.save(pythonCourse);

    const pythonSection1 = sectionRepo.create({
      courseId: pythonCourse.id,
      title: 'Python Basics for Data Science',
      order: 1,
      description: 'Python fundamentals you need for data science'
    });
    await sectionRepo.save(pythonSection1);

    const pythonLesson1 = lessonRepo.create({
      sectionId: pythonSection1.id,
      title: 'Python Setup and Jupyter Notebooks',
      content: 'Set up Python environment and learn to use Jupyter Notebooks.',
      type: 'video',
      duration: 18,
      order: 1,
      videoUrl: 'https://example.com/videos/python-setup.mp4'
    });
    await lessonRepo.save(pythonLesson1);

    // Course 5: Web Design Bootcamp
    const webDesignCourse = courseRepo.create({
      title: 'The Complete Web Design Bootcamp',
      description: 'Learn web design with HTML5, CSS3, JavaScript, Bootstrap 5, and modern design principles',
      instructor: 'Angela Yu',
      duration: 1440,
      price: 69.99,
      category: 'Design',
      level: 'Beginner',
      thumbnailUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=400&h=250&fit=crop',
      bannerUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&h=400&fit=crop',
      enrollmentCount: 2341,
      rating: 4.9
    });
    await courseRepo.save(webDesignCourse);

    const webDesignSection1 = sectionRepo.create({
      courseId: webDesignCourse.id,
      title: 'HTML Fundamentals',
      order: 1,
      description: 'Master HTML5 from the ground up'
    });
    await sectionRepo.save(webDesignSection1);

    const webDesignLesson1 = lessonRepo.create({
      sectionId: webDesignSection1.id,
      title: 'Introduction to HTML',
      content: 'Learn the basics of HTML and create your first web page.',
      type: 'video',
      duration: 14,
      order: 1,
      videoUrl: 'https://example.com/videos/html-intro.mp4'
    });
    await lessonRepo.save(webDesignLesson1);

    // Course 6: AWS Certified Solutions Architect
    const awsCourse = courseRepo.create({
      title: 'AWS Certified Solutions Architect - Associate',
      description: 'Prepare for the AWS Solutions Architect Associate exam. Learn AWS architecture and cloud computing.',
      instructor: 'Stephane Maarek',
      duration: 1560,
      price: 99.99,
      category: 'Cloud Computing',
      level: 'Advanced',
      thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=250&fit=crop',
      bannerUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=400&fit=crop',
      enrollmentCount: 1789,
      rating: 4.8
    });
    await courseRepo.save(awsCourse);

    const awsSection1 = sectionRepo.create({
      courseId: awsCourse.id,
      title: 'AWS Fundamentals',
      order: 1,
      description: 'Introduction to AWS cloud services'
    });
    await sectionRepo.save(awsSection1);

    const awsLesson1 = lessonRepo.create({
      sectionId: awsSection1.id,
      title: 'Introduction to AWS',
      content: 'Learn about Amazon Web Services and cloud computing basics.',
      type: 'video',
      duration: 20,
      order: 1,
      videoUrl: 'https://example.com/videos/aws-intro.mp4'
    });
    await lessonRepo.save(awsLesson1);

    console.log('✅ Database seeded successfully!');
    console.log('\nSeeded data summary:');
    console.log('- 4 users:');
    console.log('  • Admin: admin@lms.com / admin123');
    console.log('  • Student: john@lms.com / student123');
    console.log('  • Instructor: jane@lms.com / instructor123');
    console.log('  • Student: alice@lms.com / student123');
    console.log('- 6 courses');
    console.log('- Multiple sections and lessons per course');
    console.log('- 1 sample quiz with questions');

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
