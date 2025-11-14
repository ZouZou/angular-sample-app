import bcrypt from 'bcrypt';
import { AuthService } from './authService';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { generateToken } from '../config/jwt';
import { AppError } from '../middleware/errorHandler';

jest.mock('../config/database');
jest.mock('../config/jwt');
jest.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepository: any;

  beforeEach(() => {
    mockUserRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    (AppDataSource.getRepository as jest.Mock) = jest.fn().mockReturnValue(mockUserRepository);
    authService = new AuthService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
        role: 'student',
        avatarUrl: null,
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (generateToken as jest.Mock).mockReturnValue('mock-token');

      const result = await authService.register('Test User', 'test@example.com', 'password123');

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
        role: 'student',
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual({
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          role: 'student',
          avatarUrl: null,
        },
        token: 'mock-token',
      });
    });

    it('should throw error if email already exists', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: 1, email: 'test@example.com' });

      await expect(
        authService.register('Test User', 'test@example.com', 'password123')
      ).rejects.toThrow(new AppError('Email already registered', 400));
    });

    it('should register user with custom role', async () => {
      const mockUser = {
        id: 1,
        name: 'Instructor User',
        email: 'instructor@example.com',
        passwordHash: 'hashedPassword',
        role: 'instructor',
        avatarUrl: null,
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (generateToken as jest.Mock).mockReturnValue('mock-token');

      const result = await authService.register('Instructor User', 'instructor@example.com', 'password123', 'instructor');

      expect(mockUserRepository.create).toHaveBeenCalledWith({
        name: 'Instructor User',
        email: 'instructor@example.com',
        passwordHash: 'hashedPassword',
        role: 'instructor',
      });
      expect(result.user.role).toBe('instructor');
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
        role: 'student',
        avatarUrl: null,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (generateToken as jest.Mock).mockReturnValue('mock-token');

      const result = await authService.login('test@example.com', 'password123');

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(result).toEqual({
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          role: 'student',
          avatarUrl: null,
        },
        token: 'mock-token',
      });
    });

    it('should throw error if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        authService.login('nonexistent@example.com', 'password123')
      ).rejects.toThrow(new AppError('Invalid email or password', 401));
    });

    it('should throw error if password is invalid', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.login('test@example.com', 'wrongpassword')
      ).rejects.toThrow(new AppError('Invalid email or password', 401));
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'student',
        avatarUrl: 'https://example.com/avatar.jpg',
        createdAt: new Date('2024-01-01'),
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await authService.getProfile(1);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'student',
        avatarUrl: 'https://example.com/avatar.jpg',
        createdAt: new Date('2024-01-01'),
      });
    });

    it('should throw error if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(authService.getProfile(999)).rejects.toThrow(new AppError('User not found', 404));
    });
  });

  describe('updateProfile', () => {
    it('should update user name', async () => {
      const mockUser = {
        id: 1,
        name: 'Old Name',
        email: 'test@example.com',
        role: 'student',
        avatarUrl: null,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue({ ...mockUser, name: 'New Name' });

      const result = await authService.updateProfile(1, { name: 'New Name' });

      expect(mockUser.name).toBe('New Name');
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result.name).toBe('New Name');
    });

    it('should update user avatarUrl', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'student',
        avatarUrl: null,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue({ ...mockUser, avatarUrl: 'https://example.com/avatar.jpg' });

      const result = await authService.updateProfile(1, { avatarUrl: 'https://example.com/avatar.jpg' });

      expect(mockUser.avatarUrl).toBe('https://example.com/avatar.jpg');
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
    });

    it('should throw error if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        authService.updateProfile(999, { name: 'New Name' })
      ).rejects.toThrow(new AppError('User not found', 404));
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const mockUser = {
        id: 1,
        passwordHash: 'oldHashedPassword',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await authService.changePassword(1, 'oldPassword', 'newPassword');

      expect(bcrypt.compare).toHaveBeenCalledWith('oldPassword', 'oldHashedPassword');
      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword', 10);
      expect(mockUser.passwordHash).toBe('newHashedPassword');
      expect(result).toEqual({ message: 'Password changed successfully' });
    });

    it('should throw error if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        authService.changePassword(999, 'oldPassword', 'newPassword')
      ).rejects.toThrow(new AppError('User not found', 404));
    });

    it('should throw error if current password is incorrect', async () => {
      const mockUser = {
        id: 1,
        passwordHash: 'hashedPassword',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.changePassword(1, 'wrongPassword', 'newPassword')
      ).rejects.toThrow(new AppError('Current password is incorrect', 401));
    });
  });
});
