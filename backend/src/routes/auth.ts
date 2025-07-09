import { Router } from 'express';
import { 
  login, 
  register, 
  getProfile, 
  updateProfile, 
  getAllUsers, 
  updateUser, 
  deleteUser 
} from '../controllers/authController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/login', login as any);
router.post('/register', register as any);

// Protected routes
router.get('/profile', authenticateToken as any, getProfile as any);
router.put('/profile', authenticateToken as any, updateProfile as any);

// Admin only routes
router.get('/users', authenticateToken as any, requireRole(['admin']) as any, getAllUsers as any);
router.put('/users/:id', authenticateToken as any, requireRole(['admin']) as any, updateUser as any);
router.delete('/users/:id', authenticateToken as any, requireRole(['admin']) as any, deleteUser as any);

export default router; 