import bcrypt from 'bcrypt';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { generateToken } from '../config/jwt';
import { AppError } from '../middleware/errorHandler';

const SALT_ROUNDS = 10;

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);

  async register(name: string, email: string, password: string, role: 'student' | 'instructor' | 'admin' = 'student') {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = this.userRepository.create({
      name,
      email,
      passwordHash,
      role
    });

    await this.userRepository.save(user);

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl
      },
      token
    };
  }

  async login(email: string, password: string) {
    // Find user
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl
      },
      token
    };
  }

  async getProfile(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt
    };
  }

  async updateProfile(userId: number, data: { name?: string; avatarUrl?: string }) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (data.name) user.name = data.name;
    if (data.avatarUrl !== undefined) user.avatarUrl = data.avatarUrl;

    await this.userRepository.save(user);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl
    };
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValidPassword) {
      throw new AppError('Current password is incorrect', 401);
    }

    // Hash new password
    user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await this.userRepository.save(user);

    return { message: 'Password changed successfully' };
  }
}
