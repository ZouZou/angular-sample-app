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

    const { totalScore, totalPoints } = await this.gradeQuizAnswers(attemptId, attempt.quiz, answers);
    const { percentage, passed } = this.calculatePercentageAndStatus(totalScore, totalPoints, attempt.quiz.passingScore);

    // Update attempt with grading results
    attempt.score = totalScore;
    attempt.totalPoints = totalPoints;
    attempt.percentage = percentage;
    attempt.passed = passed;
    attempt.completedAt = new Date();

    await this.attemptRepository.save(attempt);

    return attempt;
  }

  /**
   * Grade all answers for a quiz attempt
   */
  private async gradeQuizAnswers(
    attemptId: number,
    quiz: Quiz,
    answers: Array<{ questionId: number; selectedOptionIds: number[] }>
  ): Promise<{ totalScore: number; totalPoints: number }> {
    let totalScore = 0;
    let totalPoints = 0;

    for (const answer of answers) {
      const question = quiz.questions.find(q => q.id === answer.questionId);
      if (!question) continue;

      totalPoints += question.points;

      const { isCorrect, pointsEarned } = this.gradeAnswer(question, answer.selectedOptionIds);
      totalScore += pointsEarned;

      await this.saveUserAnswer(attemptId, question.id, answer.selectedOptionIds, isCorrect, pointsEarned);
    }

    return { totalScore, totalPoints };
  }

  /**
   * Grade a single answer against the correct options
   */
  private gradeAnswer(
    question: QuizQuestion,
    selectedOptionIds: number[]
  ): { isCorrect: boolean; pointsEarned: number } {
    const correctOptionIds = question.options
      .filter(option => option.isCorrect)
      .map(option => option.id);

    const isCorrect = this.areOptionsEqual(correctOptionIds, selectedOptionIds);
    const pointsEarned = isCorrect ? question.points : 0;

    return { isCorrect, pointsEarned };
  }

  /**
   * Compare two sets of option IDs for equality
   */
  private areOptionsEqual(correctIds: number[], selectedIds: number[]): boolean {
    if (correctIds.length !== selectedIds.length) {
      return false;
    }

    const sortedCorrect = [...correctIds].sort((a, b) => a - b);
    const sortedSelected = [...selectedIds].sort((a, b) => a - b);

    return sortedCorrect.every((id, index) => id === sortedSelected[index]);
  }

  /**
   * Save a user's answer to the database
   */
  private async saveUserAnswer(
    attemptId: number,
    questionId: number,
    selectedOptionIds: number[],
    isCorrect: boolean,
    pointsEarned: number
  ): Promise<void> {
    const userAnswer = this.answerRepository.create({
      attemptId,
      questionId,
      selectedOptionIds,
      isCorrect,
      pointsEarned
    });

    await this.answerRepository.save(userAnswer);
  }

  /**
   * Calculate percentage score and pass/fail status
   */
  private calculatePercentageAndStatus(
    totalScore: number,
    totalPoints: number,
    passingScore: number
  ): { percentage: number; passed: boolean } {
    const percentage = totalPoints > 0 ? (totalScore / totalPoints) * 100 : 0;
    const roundedPercentage = Math.round(percentage * 100) / 100;
    const passed = roundedPercentage >= passingScore;

    return { percentage: roundedPercentage, passed };
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
