import { Router } from 'express';
import { VideoController } from '../controllers/videoController';
import { authenticate, authorize } from '../middleware/auth';
import { videoUpload } from '../config/upload';

const router = Router();
const videoController = new VideoController();

// Upload video and transcript (instructors/admins only)
router.post(
  '/upload/:lessonId',
  authenticate,
  authorize('instructor', 'admin'),
  videoUpload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'transcript', maxCount: 1 }
  ]),
  (req, res, next) => videoController.uploadVideo(req, res, next)
);

// Save embed URL (instructors/admins only)
router.post(
  '/embed/:lessonId',
  authenticate,
  authorize('instructor', 'admin'),
  (req, res, next) => videoController.saveEmbedUrl(req, res, next)
);

// Stream video (supports range requests for seeking)
router.get('/stream/:lessonId', (req, res, next) =>
  videoController.streamVideo(req, res, next)
);

// Get transcript
router.get('/transcript/:lessonId', (req, res, next) =>
  videoController.getTranscript(req, res, next)
);

// Update video progress
router.post('/progress', authenticate, (req, res, next) =>
  videoController.updateProgress(req, res, next)
);

// Get video analytics (instructors/admins only)
router.get(
  '/analytics/:lessonId',
  authenticate,
  authorize('instructor', 'admin'),
  (req, res, next) => videoController.getAnalytics(req, res, next)
);

// Delete video (instructors/admins only)
router.delete(
  '/:lessonId',
  authenticate,
  authorize('instructor', 'admin'),
  (req, res, next) => videoController.deleteVideo(req, res, next)
);

export default router;
