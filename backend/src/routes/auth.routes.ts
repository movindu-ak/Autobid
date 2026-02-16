import { Router } from 'express';
import {
  signup,
  login,
  googleAuth,
  getMe,
  updateProfile,
  toggleFavorite,
} from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/google', googleAuth);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/favorites/:vehicleId', protect, toggleFavorite);

export default router;
