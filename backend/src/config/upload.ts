import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../middleware/errorHandler';

// Create uploads directory structure
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');
const VIDEO_DIR = path.join(UPLOAD_DIR, 'videos');
const TRANSCRIPT_DIR = path.join(UPLOAD_DIR, 'transcripts');
const THUMBNAIL_DIR = path.join(UPLOAD_DIR, 'thumbnails');

// Ensure directories exist
[UPLOAD_DIR, VIDEO_DIR, TRANSCRIPT_DIR, THUMBNAIL_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Video file filter
const videoFileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedMimeTypes = [
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/quicktime'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type. Only MP4, WebM, OGG, and MOV files are allowed.', 400), false);
  }
};

// Transcript file filter
const transcriptFileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedMimeTypes = ['text/vtt', 'application/x-subrip', 'text/plain'];
  const allowedExtensions = ['.vtt', '.srt'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type. Only VTT and SRT files are allowed.', 400), false);
  }
};

// Video storage configuration
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, VIDEO_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const ext = path.extname(file.originalname);
    cb(null, `video-${uniqueId}${ext}`);
  }
});

// Transcript storage configuration
const transcriptStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, TRANSCRIPT_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const ext = path.extname(file.originalname);
    cb(null, `transcript-${uniqueId}${ext}`);
  }
});

// File size limits
const VIDEO_SIZE_LIMIT = 500 * 1024 * 1024; // 500MB
const TRANSCRIPT_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB

export const videoUpload = multer({
  storage: videoStorage,
  fileFilter: videoFileFilter,
  limits: { fileSize: VIDEO_SIZE_LIMIT }
});

export const transcriptUpload = multer({
  storage: transcriptStorage,
  fileFilter: transcriptFileFilter,
  limits: { fileSize: TRANSCRIPT_SIZE_LIMIT }
});

export { VIDEO_DIR, TRANSCRIPT_DIR, THUMBNAIL_DIR, UPLOAD_DIR };
