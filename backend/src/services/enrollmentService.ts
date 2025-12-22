import { AppDataSource } from '../config/database';
import { Enrollment } from '../entities/Enrollment';
import { User } from '../entities/User';
import { Course } from '../entities/Course';
import { UserProgress } from '../entities/UserProgress';
import { Lesson } from '../entities/Lesson';
import { AppError } from '../middleware/errorHandler';
import { CourseService } from './courseService';
import { CertificateService } from './certificateService';
import { EmailService } from './emailService';

const courseService = new CourseService();
const certificateService = new CertificateService();
const emailService = new EmailService();

export class EnrollmentService {
  private enrollmentRepository = AppDataSource.getRepository(Enrollment);
  private userRepository = AppDataSource.getRepository(User);
  private courseRepository = AppDataSource.getRepository(Course);
  private progressRepository = AppDataSource.getRepository(UserProgress);
  private lessonRepository = AppDataSource.getRepository(Lesson);

  async enrollInCourse(userId: number, courseId: number) {
    // Check if user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check if course exists
    const course = await this.courseRepository.findOne({ where: { id: courseId } });
    if (!course) {
      throw new AppError('Course not found', 404);
    }

    // Check if already enrolled
    const existingEnrollment = await this.enrollmentRepository.findOne({
      where: { userId, courseId }
    });

    if (existingEnrollment) {
      throw new AppError('Already enrolled in this course', 400);
    }

    // Create enrollment
    const enrollment = this.enrollmentRepository.create({
      userId,
      courseId,
      status: 'active',
      progress: 0,
      enrolledAt: new Date()
    });

    await this.enrollmentRepository.save(enrollment);

    // Increment course enrollment count
    await courseService.incrementEnrollmentCount(courseId);

    // Send enrollment confirmation email
    try {
      await emailService.sendEnrollmentConfirmation(user, course, enrollment);
    } catch (error) {
      console.error('Failed to send enrollment confirmation email:', error);
      // Don't fail the enrollment if email fails
    }

    return enrollment;
  }

  async getEnrollment(userId: number, courseId: number) {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { userId, courseId },
      relations: ['course']
    });

    if (!enrollment) {
      throw new AppError('Enrollment not found', 404);
    }

    return enrollment;
  }

  async getEnrollmentById(id: number) {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id },
      relations: ['course', 'user']
    });

    if (!enrollment) {
      throw new AppError('Enrollment not found', 404);
    }

    return enrollment;
  }

  async getUserEnrollments(userId: number) {
    const enrollments = await this.enrollmentRepository.find({
      where: { userId },
      relations: ['course'],
      order: { enrolledAt: 'DESC' }
    });

    return enrollments;
  }

  async getCourseEnrollments(courseId: number) {
    const enrollments = await this.enrollmentRepository.find({
      where: { courseId },
      relations: ['user'],
      order: { enrolledAt: 'DESC' }
    });

    return enrollments;
  }

  async updateEnrollmentStatus(id: number, status: 'active' | 'completed' | 'dropped') {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id },
      relations: ['user', 'course']
    });

    if (!enrollment) {
      throw new AppError('Enrollment not found', 404);
    }

    const wasCompleted = enrollment.status === 'completed';
    enrollment.status = status;
    enrollment.lastAccessedAt = new Date();

    if (status === 'completed' && !enrollment.completedAt) {
      enrollment.completedAt = new Date();
      enrollment.progress = 100;
    }

    await this.enrollmentRepository.save(enrollment);

    // Auto-generate certificate when course is completed
    if (status === 'completed' && !enrollment.certificateUrl) {
      try {
        await certificateService.generateCertificate(id);
        // Reload enrollment to get the updated certificateUrl
        const updatedEnrollment = await this.enrollmentRepository.findOne({
          where: { id },
          relations: ['user', 'course']
        });
        if (updatedEnrollment) {
          Object.assign(enrollment, updatedEnrollment);
        }
      } catch (error) {
        // Log error but don't fail the status update
        console.error('Failed to auto-generate certificate:', error);
      }
    }

    // Send course completion email (only if not already completed)
    if (status === 'completed' && !wasCompleted && enrollment.user && enrollment.course) {
      try {
        await emailService.sendCourseCompletion(enrollment.user, enrollment.course, enrollment);
      } catch (error) {
        console.error('Failed to send course completion email:', error);
      }
    }

    return enrollment;
  }

  async calculateProgress(enrollmentId: number) {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id: enrollmentId },
      relations: ['user', 'course']
    });

    if (!enrollment) {
      throw new AppError('Enrollment not found', 404);
    }

    // Get all lessons for this course
    const lessons = await this.lessonRepository
      .createQueryBuilder('lesson')
      .innerJoin('lesson.section', 'section')
      .where('section.courseId = :courseId', { courseId: enrollment.courseId })
      .getMany();

    if (lessons.length === 0) {
      enrollment.progress = 0;
      await this.enrollmentRepository.save(enrollment);
      return 0;
    }

    // Get completed lessons for this enrollment
    const completedProgress = await this.progressRepository
      .createQueryBuilder('progress')
      .where('progress.enrollmentId = :enrollmentId', { enrollmentId })
      .andWhere('progress.completed = :completed', { completed: true })
      .getMany();

    // Calculate percentage
    const percentage = (completedProgress.length / lessons.length) * 100;
    enrollment.progress = Math.round(percentage * 100) / 100; // Round to 2 decimal places
    enrollment.lastAccessedAt = new Date();

    // Auto-complete enrollment and generate certificate if 100% progress
    const wasCompleted = enrollment.status === 'completed';
    if (enrollment.progress >= 100 && enrollment.status !== 'completed') {
      enrollment.status = 'completed';
      enrollment.completedAt = new Date();
    }

    await this.enrollmentRepository.save(enrollment);

    // Auto-generate certificate when course is completed
    if (enrollment.progress >= 100 && !enrollment.certificateUrl) {
      try {
        await certificateService.generateCertificate(enrollmentId);
        // Reload enrollment to get the updated certificateUrl
        const updatedEnrollment = await this.enrollmentRepository.findOne({
          where: { id: enrollmentId },
          relations: ['user', 'course']
        });
        if (updatedEnrollment) {
          Object.assign(enrollment, updatedEnrollment);
        }
      } catch (error) {
        // Log error but don't fail the progress calculation
        console.error('Failed to auto-generate certificate:', error);
      }
    }

    // Send course completion email (only if just completed)
    if (enrollment.progress >= 100 && !wasCompleted && enrollment.user && enrollment.course) {
      try {
        await emailService.sendCourseCompletion(enrollment.user, enrollment.course, enrollment);
      } catch (error) {
        console.error('Failed to send course completion email:', error);
      }
    }

    return enrollment.progress;
  }

  async updateLastAccessed(enrollmentId: number) {
    const enrollment = await this.enrollmentRepository.findOne({ where: { id: enrollmentId } });

    if (!enrollment) {
      throw new AppError('Enrollment not found', 404);
    }

    enrollment.lastAccessedAt = new Date();
    await this.enrollmentRepository.save(enrollment);

    return enrollment;
  }
}
