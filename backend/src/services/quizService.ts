import { AppDataSource } from '../config/database';
import { Quiz } from '../entities/Quiz';
import { QuizQuestion } from '../entities/QuizQuestion';
import { QuizOption } from '../entities/QuizOption';
import { QuizAttempt } from '../entities/QuizAttempt';
import { UserAnswer } from '../entities/UserAnswer';
import { Course } from '../entities/Course';
import { AppError } from '../middleware/errorHandler';

export class QuizService {
  private quizRepository = AppDataSource.getRepository(Quiz);
  private questionRepository = AppDataSource.getRepository(QuizQuestion);
  private optionRepository = AppDataSource.getRepository(QuizOption);
  private attemptRepository = AppDataSource.getRepository(QuizAttempt);
  private answerRepository = AppDataSource.getRepository(UserAnswer);
  private courseRepository = AppDataSource.getRepository(Course);

  async getQuiz(id: number, includeCorrectAnswers: boolean = false) {
    const quiz = await this.quizRepository.findOne({
      where: { id },
      relations: ['questions', 'questions.options']
    });

    if (!quiz) {
      throw new AppError('Quiz not found', 404);
    }

    // Sort questions and options by order
    if (quiz.questions) {
      quiz.questions.sort((a, b) => a.order - b.order);
      quiz.questions.forEach(question => {
        if (question.options) {
          question.options.sort((a, b) => a.order - b.order);

          // Hide correct answers unless explicitly requested
          if (!includeCorrectAnswers) {
            question.options.forEach(option => {
              delete (option as any).isCorrect;
            });
          }
        }
      });
    }

    return quiz;
  }

  async getCourseQuizzes(courseId: number) {
    const quizzes = await this.quizRepository.find({
      where: { courseId },
      order: { createdAt: 'ASC' }
    });

    return quizzes;
  }

  async createQuiz(data: {
    courseId: number;
    lessonId?: number;
    title: string;
    description?: string;
    passingScore?: number;
    timeLimit?: number;
    questions: Array<{
      question: string;
      type: 'multiple-choice' | 'true-false' | 'multi-select';
      order: number;
      points: number;
      explanation?: string;
      options: Array<{
        text: string;
        isCorrect: boolean;
        order: number;
      }>;
    }>;
  }) {
    // Verify course exists
    const course = await this.courseRepository.findOne({ where: { id: data.courseId } });
    if (!course) {
      throw new AppError('Course not found', 404);
    }

    // Create quiz
    const quiz = this.quizRepository.create({
      courseId: data.courseId,
      lessonId: data.lessonId,
      title: data.title,
      description: data.description,
      passingScore: data.passingScore || 70,
      timeLimit: data.timeLimit
    });

    await this.quizRepository.save(quiz);

    // Create questions and options
    for (const questionData of data.questions) {
      const question = this.questionRepository.create({
        quizId: quiz.id,
        question: questionData.question,
        type: questionData.type,
        order: questionData.order,
        points: questionData.points,
        explanation: questionData.explanation
      });

      await this.questionRepository.save(question);

      // Create options
      for (const optionData of questionData.options) {
        const option = this.optionRepository.create({
          questionId: question.id,
          text: optionData.text,
          isCorrect: optionData.isCorrect,
          order: optionData.order
        });

        await this.optionRepository.save(option);
      }
    }

    return this.getQuiz(quiz.id);
  }

  async startQuizAttempt(userId: number, enrollmentId: number, quizId: number) {
    // Verify quiz exists
    const quiz = await this.quizRepository.findOne({ where: { id: quizId } });
    if (!quiz) {
      throw new AppError('Quiz not found', 404);
    }

    // Get existing attempts count
    const existingAttempts = await this.attemptRepository.count({
      where: { userId, quizId }
    });

    // Create new attempt
    const attempt = this.attemptRepository.create({
      userId,
      enrollmentId,
      quizId,
      attemptNumber: existingAttempts + 1,
      score: 0,
      totalPoints: 0,
      percentage: 0,
      passed: false,
      startedAt: new Date()
    });

    await this.attemptRepository.save(attempt);

    return attempt;
  }

  async submitQuizAttempt(attemptId: number, answers: Array<{ questionId: number; selectedOptionIds: number[] }>) {
    const attempt = await this.attemptRepository.findOne({
      where: { id: attemptId },
      relations: ['quiz', 'quiz.questions', 'quiz.questions.options']
    });

    if (!attempt) {
      throw new AppError('Quiz attempt not found', 404);
    }

    if (attempt.completedAt) {
      throw new AppError('Quiz attempt already submitted', 400);
    }

    const quiz = attempt.quiz;
    let totalScore = 0;
    let totalPoints = 0;

    // Grade each answer
    for (const answer of answers) {
      const question = quiz.questions.find(q => q.id === answer.questionId);
      if (!question) continue;

      totalPoints += question.points;

      // Get correct options
      const correctOptions = question.options
        .filter(o => o.isCorrect)
        .map(o => o.id)
        .sort();

      const selectedOptions = answer.selectedOptionIds.sort();

      // Check if answer is correct
      const isCorrect = JSON.stringify(correctOptions) === JSON.stringify(selectedOptions);
      const pointsEarned = isCorrect ? question.points : 0;

      totalScore += pointsEarned;

      // Save user answer
      const userAnswer = this.answerRepository.create({
        attemptId,
        questionId: question.id,
        selectedOptionIds: answer.selectedOptionIds,
        isCorrect,
        pointsEarned
      });

      await this.answerRepository.save(userAnswer);
    }

    // Calculate percentage and pass/fail
    const percentage = totalPoints > 0 ? (totalScore / totalPoints) * 100 : 0;
    const passed = percentage >= quiz.passingScore;

    // Update attempt
    attempt.score = totalScore;
    attempt.totalPoints = totalPoints;
    attempt.percentage = Math.round(percentage * 100) / 100;
    attempt.passed = passed;
    attempt.completedAt = new Date();

    await this.attemptRepository.save(attempt);

    return attempt;
  }

  async getUserQuizAttempts(userId: number, quizId: number) {
    const attempts = await this.attemptRepository.find({
      where: { userId, quizId },
      order: { attemptNumber: 'DESC' }
    });

    return attempts;
  }

  async getAttemptDetails(attemptId: number) {
    const attempt = await this.attemptRepository.findOne({
      where: { id: attemptId },
      relations: ['quiz', 'answers', 'answers.question', 'answers.question.options']
    });

    if (!attempt) {
      throw new AppError('Quiz attempt not found', 404);
    }

    return attempt;
  }

  async getBestAttempt(userId: number, quizId: number) {
    const attempts = await this.attemptRepository.find({
      where: { userId, quizId },
      order: { percentage: 'DESC' }
    });

    return attempts[0] || null;
  }
}
