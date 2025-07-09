import { Router } from 'express';
import { login, register, getProfile } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/login', login as any);
router.post('/register', register as any);

// Protected routes
router.get('/profile', authenticateToken as any, getProfile as any);
router.put('/profile', authenticateToken as any, require('../controllers/authController').updateProfile as any);

export default router; 