import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/register', (req, res, next) => authController.register(req, res, next));
router.post('/login', (req, res, next) => authController.login(req, res, next));

// Protected routes
router.get('/me', authenticate, (req, res, next) => authController.getProfile(req, res, next));
router.put('/profile', authenticate, (req, res, next) => authController.updateProfile(req, res, next));
router.post('/change-password', authenticate, (req, res, next) => authController.changePassword(req, res, next));

export default router;
