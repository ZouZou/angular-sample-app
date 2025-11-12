import { AppDataSource } from '../config/database';
import { UserProgress } from '../entities/UserProgress';
import { Enrollment } from '../entities/Enrollment';
import { Lesson } from '../entities/Lesson';
import { AppError } from '../middleware/errorHandler';
import { EnrollmentService } from './enrollmentService';

const enrollmentService = new EnrollmentService();

export class ProgressService {
  private progressRepository = AppDataSource.getRepository(UserProgress);
  private enrollmentRepository = AppDataSource.getRepository(Enrollment);
  private lessonRepository = AppDataSource.getRepository(Lesson);

  async getUserProgress(enrollmentId: number) {
    const enrollment = await this.enrollmentRepository.findOne({ where: { id: enrollmentId } });

    if (!enrollment) {
      throw new AppError('Enrollment not found', 404);
    }

    const progress = await this.progressRepository.find({
      where: { enrollmentId },
      relations: ['lesson'],
      order: { createdAt: 'ASC' }
    });

    return progress;
  }

  async getLessonProgress(userId: number, lessonId: number) {
    const progress = await this.progressRepository.findOne({
      where: { userId, lessonId },
      relations: ['lesson']
    });

    return progress || null;
  }

  async markLessonComplete(userId: number, enrollmentId: number, lessonId: number) {
    // Verify enrollment exists
    const enrollment = await this.enrollmentRepository.findOne({ where: { id: enrollmentId } });
    if (!enrollment) {
      throw new AppError('Enrollment not found', 404);
    }

    // Verify lesson exists
    const lesson = await this.lessonRepository.findOne({ where: { id: lessonId } });
    if (!lesson) {
      throw new AppError('Lesson not found', 404);
    }

    // Check if progress already exists
    let progress = await this.progressRepository.findOne({
      where: { userId, lessonId }
    });

    if (progress) {
      // Update existing progress
      progress.completed = true;
      progress.completedAt = new Date();
    } else {
      // Create new progress record
      progress = this.progressRepository.create({
        userId,
        enrollmentId,
        lessonId,
        completed: true,
        completedAt: new Date(),
        timeSpent: 0
      });
    }

    await this.progressRepository.save(progress);

    // Update enrollment progress
    await enrollmentService.calculateProgress(enrollmentId);

    // Update last accessed time
    await enrollmentService.updateLastAccessed(enrollmentId);

    return progress;
  }

  async trackTimeSpent(progressId: number, minutes: number) {
    const progress = await this.progressRepository.findOne({ where: { id: progressId } });

    if (!progress) {
      throw new AppError('Progress record not found', 404);
    }

    progress.timeSpent = (progress.timeSpent || 0) + minutes;
    await this.progressRepository.save(progress);

    // Update last accessed time
    await enrollmentService.updateLastAccessed(progress.enrollmentId);

    return progress;
  }

  async updateLessonNotes(userId: number, enrollmentId: number, lessonId: number, notes: string) {
    // Verify enrollment exists
    const enrollment = await this.enrollmentRepository.findOne({ where: { id: enrollmentId } });
    if (!enrollment) {
      throw new AppError('Enrollment not found', 404);
    }

    // Verify lesson exists
    const lesson = await this.lessonRepository.findOne({ where: { id: lessonId } });
    if (!lesson) {
      throw new AppError('Lesson not found', 404);
    }

    // Check if progress already exists
    let progress = await this.progressRepository.findOne({
      where: { userId, lessonId }
    });

    if (progress) {
      // Update existing progress
      progress.notes = notes;
    } else {
      // Create new progress record with notes
      progress = this.progressRepository.create({
        userId,
        enrollmentId,
        lessonId,
        completed: false,
        notes,
        timeSpent: 0
      });
    }

    await this.progressRepository.save(progress);

    // Update last accessed time
    await enrollmentService.updateLastAccessed(enrollmentId);

    return progress;
  }

  async getProgressStats(userId: number) {
    // Get all enrollments
    const enrollments = await this.enrollmentRepository.find({
      where: { userId },
      relations: ['course']
    });

    // Get all progress records
    const allProgress = await this.progressRepository.find({
      where: { userId }
    });

    const completedLessons = allProgress.filter(p => p.completed).length;
    const totalTimeSpent = allProgress.reduce((sum, p) => sum + (p.timeSpent || 0), 0);

    return {
      totalEnrollments: enrollments.length,
      activeEnrollments: enrollments.filter(e => e.status === 'active').length,
      completedEnrollments: enrollments.filter(e => e.status === 'completed').length,
      completedLessons,
      totalTimeSpent
    };
  }
}
