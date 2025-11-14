import { QuizService } from './quizService';
import { AppDataSource } from '../config/database';
import { Quiz } from '../entities/Quiz';
import { QuizQuestion } from '../entities/QuizQuestion';
import { QuizOption } from '../entities/QuizOption';
import { QuizAttempt } from '../entities/QuizAttempt';
import { UserAnswer } from '../entities/UserAnswer';
import { Course } from '../entities/Course';
import { AppError } from '../middleware/errorHandler';

jest.mock('../config/database');

describe('QuizService', () => {
  let quizService: QuizService;
  let mockQuizRepository: any;
  let mockQuestionRepository: any;
  let mockOptionRepository: any;
  let mockAttemptRepository: any;
  let mockAnswerRepository: any;
  let mockCourseRepository: any;

  beforeEach(() => {
    mockQuizRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    mockQuestionRepository = {
      create: jest.fn(),
      save: jest.fn(),
    };

    mockOptionRepository = {
      create: jest.fn(),
      save: jest.fn(),
    };

    mockAttemptRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    mockAnswerRepository = {
      create: jest.fn(),
      save: jest.fn(),
    };

    mockCourseRepository = {
      findOne: jest.fn(),
    };

    (AppDataSource.getRepository as jest.Mock) = jest.fn((entity) => {
      if (entity === Quiz) return mockQuizRepository;
      if (entity === QuizQuestion) return mockQuestionRepository;
      if (entity === QuizOption) return mockOptionRepository;
      if (entity === QuizAttempt) return mockAttemptRepository;
      if (entity === UserAnswer) return mockAnswerRepository;
      if (entity === Course) return mockCourseRepository;
      return {};
    });

    quizService = new QuizService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getQuiz', () => {
    it('should get quiz with sorted questions and options', async () => {
      const mockQuiz = {
        id: 1,
        title: 'Test Quiz',
        questions: [
          {
            id: 2,
            order: 2,
            options: [
              { id: 3, order: 2, isCorrect: false },
              { id: 1, order: 1, isCorrect: true },
            ],
          },
          {
            id: 1,
            order: 1,
            options: [{ id: 2, order: 1, isCorrect: true }],
          },
        ],
      };

      mockQuizRepository.findOne.mockResolvedValue(mockQuiz);

      const result = await quizService.getQuiz(1);

      expect(result.questions[0].order).toBe(1);
      expect(result.questions[1].order).toBe(2);
      expect(result.questions[1].options[0].order).toBe(1);
      expect(result.questions[1].options[1].order).toBe(2);
    });

    it('should hide correct answers by default', async () => {
      const mockQuiz = {
        id: 1,
        questions: [
          {
            id: 1,
            order: 1,
            options: [
              { id: 1, order: 1, isCorrect: true },
              { id: 2, order: 2, isCorrect: false },
            ],
          },
        ],
      };

      mockQuizRepository.findOne.mockResolvedValue(mockQuiz);

      const result = await quizService.getQuiz(1);

      expect((result.questions[0].options[0] as any).isCorrect).toBeUndefined();
      expect((result.questions[0].options[1] as any).isCorrect).toBeUndefined();
    });

    it('should include correct answers when requested', async () => {
      const mockQuiz = {
        id: 1,
        questions: [
          {
            id: 1,
            order: 1,
            options: [
              { id: 1, order: 1, isCorrect: true },
              { id: 2, order: 2, isCorrect: false },
            ],
          },
        ],
      };

      mockQuizRepository.findOne.mockResolvedValue(mockQuiz);

      const result = await quizService.getQuiz(1, true);

      expect(result.questions[0].options[0].isCorrect).toBe(true);
      expect(result.questions[0].options[1].isCorrect).toBe(false);
    });

    it('should throw error if quiz not found', async () => {
      mockQuizRepository.findOne.mockResolvedValue(null);

      await expect(quizService.getQuiz(999)).rejects.toThrow(new AppError('Quiz not found', 404));
    });
  });

  describe('getCourseQuizzes', () => {
    it('should get all quizzes for a course', async () => {
      const mockQuizzes = [
        { id: 1, courseId: 1, title: 'Quiz 1' },
        { id: 2, courseId: 1, title: 'Quiz 2' },
      ];

      mockQuizRepository.find.mockResolvedValue(mockQuizzes);

      const result = await quizService.getCourseQuizzes(1);

      expect(mockQuizRepository.find).toHaveBeenCalledWith({
        where: { courseId: 1 },
        order: { createdAt: 'ASC' },
      });
      expect(result).toEqual(mockQuizzes);
    });
  });

  describe('createQuiz', () => {
    it('should create quiz with questions and options', async () => {
      const quizData = {
        courseId: 1,
        title: 'New Quiz',
        description: 'Quiz description',
        passingScore: 80,
        questions: [
          {
            question: 'What is 2+2?',
            type: 'multiple-choice' as const,
            order: 1,
            points: 10,
            options: [
              { text: '3', isCorrect: false, order: 1 },
              { text: '4', isCorrect: true, order: 2 },
            ],
          },
        ],
      };

      const mockCourse = { id: 1, title: 'Test Course' };
      const mockQuiz = { id: 1, ...quizData };
      const mockQuestion = { id: 1, quizId: 1 };
      const mockOption = { id: 1, questionId: 1 };

      mockCourseRepository.findOne.mockResolvedValue(mockCourse);
      mockQuizRepository.create.mockReturnValue(mockQuiz);
      mockQuizRepository.save.mockResolvedValue(mockQuiz);
      mockQuestionRepository.create.mockReturnValue(mockQuestion);
      mockQuestionRepository.save.mockResolvedValue(mockQuestion);
      mockOptionRepository.create.mockReturnValue(mockOption);
      mockOptionRepository.save.mockResolvedValue(mockOption);
      mockQuizRepository.findOne.mockResolvedValue({ ...mockQuiz, questions: [] });

      await quizService.createQuiz(quizData);

      expect(mockCourseRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockQuizRepository.create).toHaveBeenCalled();
      expect(mockQuestionRepository.save).toHaveBeenCalled();
      expect(mockOptionRepository.save).toHaveBeenCalledTimes(2);
    });

    it('should throw error if course not found', async () => {
      mockCourseRepository.findOne.mockResolvedValue(null);

      await expect(
        quizService.createQuiz({
          courseId: 999,
          title: 'Quiz',
          questions: [],
        })
      ).rejects.toThrow(new AppError('Course not found', 404));
    });
  });

  describe('startQuizAttempt', () => {
    it('should create a new quiz attempt', async () => {
      const mockQuiz = { id: 1, title: 'Test Quiz' };
      const mockAttempt = {
        id: 1,
        userId: 1,
        enrollmentId: 1,
        quizId: 1,
        attemptNumber: 1,
        score: 0,
      };

      mockQuizRepository.findOne.mockResolvedValue(mockQuiz);
      mockAttemptRepository.count.mockResolvedValue(0);
      mockAttemptRepository.create.mockReturnValue(mockAttempt);
      mockAttemptRepository.save.mockResolvedValue(mockAttempt);

      const result = await quizService.startQuizAttempt(1, 1, 1);

      expect(mockAttemptRepository.count).toHaveBeenCalledWith({
        where: { userId: 1, quizId: 1 },
      });
      expect(mockAttemptRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          attemptNumber: 1,
        })
      );
      expect(result).toEqual(mockAttempt);
    });

    it('should increment attempt number for subsequent attempts', async () => {
      const mockQuiz = { id: 1, title: 'Test Quiz' };
      const mockAttempt = {
        userId: 1,
        quizId: 1,
        attemptNumber: 3,
      };

      mockQuizRepository.findOne.mockResolvedValue(mockQuiz);
      mockAttemptRepository.count.mockResolvedValue(2);
      mockAttemptRepository.create.mockReturnValue(mockAttempt);
      mockAttemptRepository.save.mockResolvedValue(mockAttempt);

      await quizService.startQuizAttempt(1, 1, 1);

      expect(mockAttemptRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          attemptNumber: 3,
        })
      );
    });

    it('should throw error if quiz not found', async () => {
      mockQuizRepository.findOne.mockResolvedValue(null);

      await expect(quizService.startQuizAttempt(1, 1, 999)).rejects.toThrow(
        new AppError('Quiz not found', 404)
      );
    });
  });

  describe('submitQuizAttempt', () => {
    it('should grade quiz and calculate score', async () => {
      const mockAttempt = {
        id: 1,
        quiz: {
          passingScore: 70,
          questions: [
            {
              id: 1,
              points: 10,
              options: [
                { id: 1, isCorrect: false },
                { id: 2, isCorrect: true },
              ],
            },
            {
              id: 2,
              points: 10,
              options: [
                { id: 3, isCorrect: true },
                { id: 4, isCorrect: false },
              ],
            },
          ],
        },
        completedAt: null,
      };

      const answers = [
        { questionId: 1, selectedOptionIds: [2] }, // Correct
        { questionId: 2, selectedOptionIds: [4] }, // Incorrect
      ];

      mockAttemptRepository.findOne.mockResolvedValue(mockAttempt);
      mockAnswerRepository.create.mockImplementation((data: any) => data);
      mockAnswerRepository.save.mockResolvedValue({});
      mockAttemptRepository.save.mockResolvedValue(mockAttempt);

      const result = await quizService.submitQuizAttempt(1, answers);

      expect(result.score).toBe(10);
      expect(result.totalPoints).toBe(20);
      expect(result.percentage).toBe(50);
      expect(result.passed).toBe(false);
      expect(result.completedAt).toBeInstanceOf(Date);
    });

    it('should mark as passed when score meets passing score', async () => {
      const mockAttempt = {
        id: 1,
        quiz: {
          passingScore: 70,
          questions: [
            {
              id: 1,
              points: 10,
              options: [{ id: 1, isCorrect: true }],
            },
          ],
        },
        completedAt: null,
      };

      const answers = [{ questionId: 1, selectedOptionIds: [1] }];

      mockAttemptRepository.findOne.mockResolvedValue(mockAttempt);
      mockAnswerRepository.create.mockImplementation((data: any) => data);
      mockAnswerRepository.save.mockResolvedValue({});
      mockAttemptRepository.save.mockResolvedValue(mockAttempt);

      const result = await quizService.submitQuizAttempt(1, answers);

      expect(result.percentage).toBe(100);
      expect(result.passed).toBe(true);
    });

    it('should throw error if attempt not found', async () => {
      mockAttemptRepository.findOne.mockResolvedValue(null);

      await expect(quizService.submitQuizAttempt(999, [])).rejects.toThrow(
        new AppError('Quiz attempt not found', 404)
      );
    });

    it('should throw error if attempt already submitted', async () => {
      const mockAttempt = {
        id: 1,
        completedAt: new Date(),
      };

      mockAttemptRepository.findOne.mockResolvedValue(mockAttempt);

      await expect(quizService.submitQuizAttempt(1, [])).rejects.toThrow(
        new AppError('Quiz attempt already submitted', 400)
      );
    });
  });

  describe('getUserQuizAttempts', () => {
    it('should get all user attempts for a quiz', async () => {
      const mockAttempts = [
        { id: 2, attemptNumber: 2, percentage: 90 },
        { id: 1, attemptNumber: 1, percentage: 70 },
      ];

      mockAttemptRepository.find.mockResolvedValue(mockAttempts);

      const result = await quizService.getUserQuizAttempts(1, 1);

      expect(mockAttemptRepository.find).toHaveBeenCalledWith({
        where: { userId: 1, quizId: 1 },
        order: { attemptNumber: 'DESC' },
      });
      expect(result).toEqual(mockAttempts);
    });
  });

  describe('getAttemptDetails', () => {
    it('should get attempt with full details', async () => {
      const mockAttempt = {
        id: 1,
        quiz: { id: 1 },
        answers: [{ id: 1 }],
      };

      mockAttemptRepository.findOne.mockResolvedValue(mockAttempt);

      const result = await quizService.getAttemptDetails(1);

      expect(mockAttemptRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['quiz', 'answers', 'answers.question', 'answers.question.options'],
      });
      expect(result).toEqual(mockAttempt);
    });

    it('should throw error if attempt not found', async () => {
      mockAttemptRepository.findOne.mockResolvedValue(null);

      await expect(quizService.getAttemptDetails(999)).rejects.toThrow(
        new AppError('Quiz attempt not found', 404)
      );
    });
  });

  describe('getBestAttempt', () => {
    it('should return best attempt by percentage', async () => {
      const mockAttempts = [
        { id: 2, percentage: 90 },
        { id: 1, percentage: 70 },
      ];

      mockAttemptRepository.find.mockResolvedValue(mockAttempts);

      const result = await quizService.getBestAttempt(1, 1);

      expect(mockAttemptRepository.find).toHaveBeenCalledWith({
        where: { userId: 1, quizId: 1 },
        order: { percentage: 'DESC' },
      });
      expect(result).toEqual(mockAttempts[0]);
    });

    it('should return null if no attempts exist', async () => {
      mockAttemptRepository.find.mockResolvedValue([]);

      const result = await quizService.getBestAttempt(1, 1);

      expect(result).toBeNull();
    });
  });
});
