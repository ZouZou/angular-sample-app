import { AppDataSource } from '../config/database';
import { Lesson } from '../entities/Lesson';
import { VideoAnalytics } from '../entities/VideoAnalytics';
import { UserProgress } from '../entities/UserProgress';
import { AppError } from '../middleware/errorHandler';
import fs from 'fs';
import path from 'path';

export interface VideoProgressUpdate {
  currentPosition: number;
  duration: number;
  playbackSpeed: number;
  sessionId: string;
  pausedCount?: number;
  seekedCount?: number;
}

export interface VideoAnalyticsQuery {
  lessonId: number;
  startDate?: Date;
  endDate?: Date;
}

export class VideoService {
  private lessonRepository = AppDataSource.getRepository(Lesson);
  private videoAnalyticsRepository = AppDataSource.getRepository(VideoAnalytics);
  private progressRepository = AppDataSource.getRepository(UserProgress);

  async uploadVideo(
    lessonId: number,
    videoFile: Express.Multer.File,
    transcriptFile?: Express.Multer.File
  ) {
    const lesson = await this.lessonRepository.findOne({ where: { id: lessonId } });
    if (!lesson) {
      throw new AppError('Lesson not found', 404);
    }

    // Delete old video file if exists
    if (lesson.videoFilePath && fs.existsSync(lesson.videoFilePath)) {
      fs.unlinkSync(lesson.videoFilePath);
    }

    // Update lesson with video info
    lesson.videoType = 'upload';
    lesson.videoFilePath = videoFile.path;
    lesson.videoMimeType = videoFile.mimetype;
    lesson.videoSizeBytes = videoFile.size;
    lesson.videoUrl = undefined; // Clear embed URL if switching to upload

    if (transcriptFile) {
      lesson.transcriptFilePath = transcriptFile.path;
      lesson.transcriptUrl = `/api/videos/transcript/${lessonId}`;
    }

    await this.lessonRepository.save(lesson);
    return lesson;
  }

  async saveEmbedUrl(lessonId: number, embedUrl: string) {
    const lesson = await this.lessonRepository.findOne({ where: { id: lessonId } });
    if (!lesson) {
      throw new AppError('Lesson not found', 404);
    }

    // Clear upload info if switching to embed
    if (lesson.videoFilePath && fs.existsSync(lesson.videoFilePath)) {
      fs.unlinkSync(lesson.videoFilePath);
    }

    lesson.videoType = 'embed';
    lesson.videoUrl = embedUrl;
    lesson.videoFilePath = undefined;
    lesson.videoMimeType = undefined;
    lesson.videoSizeBytes = undefined;

    await this.lessonRepository.save(lesson);
    return lesson;
  }

  async getLesson(lessonId: number) {
    const lesson = await this.lessonRepository.findOne({ where: { id: lessonId } });
    if (!lesson) {
      throw new AppError('Lesson not found', 404);
    }
    return lesson;
  }

  async updateVideoProgress(
    userId: number,
    enrollmentId: number,
    lessonId: number,
    progressData: VideoProgressUpdate
  ) {
    // Get or create progress record
    let progress = await this.progressRepository.findOne({
      where: { userId, lessonId }
    });

    if (!progress) {
      progress = this.progressRepository.create({
        userId,
        enrollmentId,
        lessonId,
        completed: false,
        timeSpent: 0
      });
    }

    // Calculate watch percentage
    const watchPercentage = progressData.duration > 0
      ? Math.min((progressData.currentPosition / progressData.duration) * 100, 100)
      : 0;

    // Update progress fields
    progress.currentPosition = Math.floor(progressData.currentPosition);
    progress.watchPercentage = Number(watchPercentage.toFixed(2));
    progress.playbackSpeed = progressData.playbackSpeed;
    progress.lastWatchedAt = new Date();

    // Auto-complete if watched >= 90%
    if (watchPercentage >= 90 && !progress.completed) {
      progress.completed = true;
      progress.completedAt = new Date();
    }

    await this.progressRepository.save(progress);

    // Update analytics
    await this.updateVideoAnalytics(userId, enrollmentId, lessonId, progressData);

    return progress;
  }

  private async updateVideoAnalytics(
    userId: number,
    enrollmentId: number,
    lessonId: number,
    progressData: VideoProgressUpdate
  ) {
    let analytics = await this.videoAnalyticsRepository.findOne({
      where: {
        sessionId: progressData.sessionId,
        userId,
        lessonId
      }
    });

    if (!analytics) {
      analytics = this.videoAnalyticsRepository.create({
        userId,
        enrollmentId,
        lessonId,
        sessionId: progressData.sessionId,
        watchDuration: 0,
        totalDuration: 0,
        completionPercentage: 0,
        playbackSpeed: progressData.playbackSpeed,
        pausedCount: 0,
        seekedCount: 0
      });
    }

    // Update analytics
    analytics.completionPercentage = Number(
      ((progressData.currentPosition / progressData.duration) * 100).toFixed(2)
    );
    analytics.playbackSpeed = progressData.playbackSpeed;

    if (progressData.pausedCount !== undefined) {
      analytics.pausedCount = progressData.pausedCount;
    }
    if (progressData.seekedCount !== undefined) {
      analytics.seekedCount = progressData.seekedCount;
    }

    await this.videoAnalyticsRepository.save(analytics);
  }

  async getVideoAnalytics(query: VideoAnalyticsQuery) {
    const qb = this.videoAnalyticsRepository
      .createQueryBuilder('analytics')
      .leftJoinAndSelect('analytics.user', 'user')
      .where('analytics.lessonId = :lessonId', { lessonId: query.lessonId });

    if (query.startDate) {
      qb.andWhere('analytics.sessionStart >= :startDate', { startDate: query.startDate });
    }
    if (query.endDate) {
      qb.andWhere('analytics.sessionStart <= :endDate', { endDate: query.endDate });
    }

    const analytics = await qb.getMany();

    // Aggregate stats
    const totalViews = analytics.length;
    const uniqueViewers = new Set(analytics.map(a => a.userId)).size;
    const averageCompletion = totalViews > 0
      ? analytics.reduce((sum, a) => sum + Number(a.completionPercentage), 0) / totalViews
      : 0;
    const averageWatchDuration = totalViews > 0
      ? analytics.reduce((sum, a) => sum + a.watchDuration, 0) / totalViews
      : 0;

    return {
      lessonId: query.lessonId,
      totalViews,
      uniqueViewers,
      averageCompletion: Math.round(averageCompletion * 100) / 100,
      averageWatchDuration: Math.round(averageWatchDuration),
      sessions: analytics
    };
  }

  async deleteVideo(lessonId: number) {
    const lesson = await this.lessonRepository.findOne({ where: { id: lessonId } });
    if (!lesson) {
      throw new AppError('Lesson not found', 404);
    }

    // Delete video file
    if (lesson.videoFilePath && fs.existsSync(lesson.videoFilePath)) {
      fs.unlinkSync(lesson.videoFilePath);
    }

    // Delete transcript file
    if (lesson.transcriptFilePath && fs.existsSync(lesson.transcriptFilePath)) {
      fs.unlinkSync(lesson.transcriptFilePath);
    }

    // Clear video fields
    lesson.videoType = undefined;
    lesson.videoFilePath = undefined;
    lesson.videoMimeType = undefined;
    lesson.videoSizeBytes = undefined;
    lesson.transcriptFilePath = undefined;
    lesson.transcriptUrl = undefined;

    await this.lessonRepository.save(lesson);
    return { message: 'Video deleted successfully' };
  }
}
