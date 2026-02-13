import { Router } from 'express';
import {
  signup,
  login,
  getMe,
  updateProfile,
  toggleFavorite,
} from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/favorites/:vehicleId', protect, toggleFavorite);

export default router;
