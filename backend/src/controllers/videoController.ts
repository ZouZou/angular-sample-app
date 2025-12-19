import { Request, Response, NextFunction } from 'express';
import { VideoService } from '../services/videoService';
import { AppError } from '../middleware/errorHandler';
import fs from 'fs';

const videoService = new VideoService();

export class VideoController {
  async uploadVideo(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { lessonId } = req.params;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const videoFile = files?.['video']?.[0];
      const transcriptFile = files?.['transcript']?.[0];

      if (!videoFile) {
        throw new AppError('Video file is required', 400);
      }

      const lesson = await videoService.uploadVideo(
        parseInt(lessonId),
        videoFile,
        transcriptFile
      );

      res.json({
        message: 'Video uploaded successfully',
        lesson
      });
    } catch (error) {
      next(error);
    }
  }

  async saveEmbedUrl(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { lessonId } = req.params;
      const { embedUrl } = req.body;

      if (!embedUrl) {
        throw new AppError('Embed URL is required', 400);
      }

      const lesson = await videoService.saveEmbedUrl(parseInt(lessonId), embedUrl);

      res.json({
        message: 'Embed URL saved successfully',
        lesson
      });
    } catch (error) {
      next(error);
    }
  }

  async streamVideo(req: Request, res: Response, next: NextFunction) {
    try {
      const { lessonId } = req.params;
      const lesson = await videoService.getLesson(parseInt(lessonId));

      if (!lesson || !lesson.videoFilePath) {
        throw new AppError('Video not found', 404);
      }

      const videoPath = lesson.videoFilePath;
      const stat = fs.statSync(videoPath);
      const fileSize = stat.size;
      const range = req.headers.range;

      if (range) {
        // Partial content streaming (for seeking)
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(videoPath, { start, end });

        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': lesson.videoMimeType || 'video/mp4',
        });

        file.pipe(res);
      } else {
        // Full video streaming
        res.writeHead(200, {
          'Content-Length': fileSize,
          'Content-Type': lesson.videoMimeType || 'video/mp4',
        });
        fs.createReadStream(videoPath).pipe(res);
      }
    } catch (error) {
      next(error);
    }
  }

  async getTranscript(req: Request, res: Response, next: NextFunction) {
    try {
      const { lessonId } = req.params;
      const lesson = await videoService.getLesson(parseInt(lessonId));

      if (!lesson || !lesson.transcriptFilePath) {
        throw new AppError('Transcript not found', 404);
      }

      res.sendFile(lesson.transcriptFilePath);
    } catch (error) {
      next(error);
    }
  }

  async updateProgress(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { enrollmentId, lessonId, currentPosition, duration, playbackSpeed, sessionId, pausedCount, seekedCount } = req.body;

      if (!enrollmentId || !lessonId || currentPosition === undefined || !duration || !sessionId) {
        throw new AppError('Missing required fields', 400);
      }

      const progress = await videoService.updateVideoProgress(
        req.user.userId,
        enrollmentId,
        lessonId,
        {
          currentPosition,
          duration,
          playbackSpeed: playbackSpeed || 1,
          sessionId,
          pausedCount,
          seekedCount
        }
      );

      res.json(progress);
    } catch (error) {
      next(error);
    }
  }

  async getAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { lessonId } = req.params;
      const { startDate, endDate } = req.query;

      const analytics = await videoService.getVideoAnalytics({
        lessonId: parseInt(lessonId),
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined
      });

      res.json(analytics);
    } catch (error) {
      next(error);
    }
  }

  async deleteVideo(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { lessonId } = req.params;
      const result = await videoService.deleteVideo(parseInt(lessonId));

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
