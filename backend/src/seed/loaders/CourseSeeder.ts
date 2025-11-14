import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Course } from '../../entities/Course';
import { CourseSection } from '../../entities/CourseSection';
import { Lesson } from '../../entities/Lesson';
import { Quiz } from '../../entities/Quiz';
import { QuizQuestion } from '../../entities/QuizQuestion';
import { QuizOption } from '../../entities/QuizOption';

interface CourseSeedData {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: number;
  price: number;
  category: string;
  level: string;
  thumbnailUrl?: string;
  bannerUrl?: string;
  enrollmentCount?: number;
  rating?: number;
  language?: string;
  requirements?: string[];
  learningOutcomes?: string[];
  published?: boolean;
  contentFile?: string;
}

interface CourseContentData {
  sections?: SectionData[];
  quizzes?: QuizData[];
}

interface SectionData {
  title: string;
  description?: string;
  order: number;
  lessons: LessonData[];
}

interface LessonData {
  title: string;
  description?: string;
  type: 'video' | 'text' | 'quiz' | 'assignment';
  duration: number;
  order: number;
  videoUrl?: string;
  content?: string;
  quizId?: number;
}

interface QuizData {
  title: string;
  description?: string;
  passingScore: number;
  timeLimit?: number;
  questions: QuestionData[];
}

interface QuestionData {
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  points: number;
  order: number;
  options?: OptionData[];
  explanation?: string;
}

interface OptionData {
  text: string;
  isCorrect: boolean;
  order: number;
}

export class CourseSeeder {
  private courseRepo;
  private sectionRepo;
  private lessonRepo;
  private quizRepo;
  private questionRepo;
  private optionRepo;

  constructor(private dataSource: DataSource) {
    this.courseRepo = dataSource.getRepository(Course);
    this.sectionRepo = dataSource.getRepository(CourseSection);
    this.lessonRepo = dataSource.getRepository(Lesson);
    this.quizRepo = dataSource.getRepository(Quiz);
    this.questionRepo = dataSource.getRepository(QuizQuestion);
    this.optionRepo = dataSource.getRepository(QuizOption);
  }

  async seed(): Promise<void> {
    console.log('Loading course data...');
    const courses = await this.loadCourses();

    for (const courseData of courses) {
      console.log(`Creating course: ${courseData.title}`);
      const course = await this.createCourse(courseData);

      if (courseData.contentFile) {
        const content = await this.loadCourseContent(courseData.contentFile);
        await this.createCourseContent(course, content);
      }
    }

    console.log('Courses seeded successfully');
  }

  private async loadCourses(): Promise<CourseSeedData[]> {
    const dataPath = path.join(__dirname, '../data/courses.json');
    const fileContent = fs.readFileSync(dataPath, 'utf-8');
    return JSON.parse(fileContent);
  }

  private async loadCourseContent(contentFile: string): Promise<CourseContentData> {
    const dataPath = path.join(__dirname, '../data', contentFile);

    if (!fs.existsSync(dataPath)) {
      console.log(`Content file not found: ${contentFile}, skipping detailed content`);
      return {};
    }

    const fileContent = fs.readFileSync(dataPath, 'utf-8');
    return JSON.parse(fileContent);
  }

  private async createCourse(data: CourseSeedData): Promise<Course> {
    const course = this.courseRepo.create({
      title: data.title,
      description: data.description,
      instructor: data.instructor,
      duration: data.duration,
      price: data.price,
      category: data.category,
      level: data.level,
      thumbnailUrl: data.thumbnailUrl,
      bannerUrl: data.bannerUrl,
      enrollmentCount: data.enrollmentCount,
      rating: data.rating,
      language: data.language,
      requirements: data.requirements,
      learningOutcomes: data.learningOutcomes,
      published: data.published
    });

    return await this.courseRepo.save(course);
  }

  private async createCourseContent(course: Course, content: CourseContentData): Promise<void> {
    // Create quizzes first (so we can reference them in lessons)
    const quizMap = new Map<number, Quiz>();
    if (content.quizzes) {
      for (let i = 0; i < content.quizzes.length; i++) {
        const quiz = await this.createQuiz(course, content.quizzes[i]);
        quizMap.set(i, quiz);
      }
    }

    // Create sections and lessons
    if (content.sections) {
      for (const sectionData of content.sections) {
        await this.createSection(course, sectionData, quizMap);
      }
    }
  }

  private async createSection(
    course: Course,
    data: SectionData,
    quizMap: Map<number, Quiz>
  ): Promise<CourseSection> {
    const section = this.sectionRepo.create({
      courseId: course.id,
      title: data.title,
      description: data.description || '',
      order: data.order
    });

    const savedSection = await this.sectionRepo.save(section);

    // Create lessons for this section
    for (const lessonData of data.lessons) {
      await this.createLesson(savedSection, lessonData, quizMap);
    }

    return savedSection;
  }

  private async createLesson(
    section: CourseSection,
    data: LessonData,
    quizMap: Map<number, Quiz>
  ): Promise<Lesson> {
    const lesson = this.lessonRepo.create({
      sectionId: section.id,
      title: data.title,
      description: data.description || '',
      type: data.type,
      duration: data.duration,
      order: data.order,
      videoUrl: data.videoUrl,
      content: data.content,
      quizId: data.quizId !== undefined ? quizMap.get(data.quizId)?.id : undefined
    });

    return await this.lessonRepo.save(lesson);
  }

  private async createQuiz(course: Course, data: QuizData): Promise<Quiz> {
    const quiz = this.quizRepo.create({
      courseId: course.id,
      title: data.title,
      description: data.description || '',
      passingScore: data.passingScore,
      timeLimit: data.timeLimit
    });

    const savedQuiz = await this.quizRepo.save(quiz);

    // Create questions for this quiz
    for (const questionData of data.questions) {
      await this.createQuestion(savedQuiz, questionData);
    }

    return savedQuiz;
  }

  private async createQuestion(quiz: Quiz, data: QuestionData): Promise<QuizQuestion> {
    const question = this.questionRepo.create({
      quizId: quiz.id,
      question: data.question,
      type: data.type,
      points: data.points,
      order: data.order,
      explanation: data.explanation
    });

    const savedQuestion = await this.questionRepo.save(question);

    // Create options for this question
    if (data.options) {
      for (const optionData of data.options) {
        await this.createOption(savedQuestion, optionData);
      }
    }

    return savedQuestion;
  }

  private async createOption(question: QuizQuestion, data: OptionData): Promise<QuizOption> {
    const option = this.optionRepo.create({
      questionId: question.id,
      text: data.text,
      isCorrect: data.isCorrect,
      order: data.order
    });

    return await this.optionRepo.save(option);
  }

  async clear(): Promise<void> {
    await this.optionRepo.clear();
    await this.questionRepo.clear();
    await this.quizRepo.clear();
    await this.lessonRepo.clear();
    await this.sectionRepo.clear();
    await this.courseRepo.clear();
  }
}
