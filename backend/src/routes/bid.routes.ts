import { Router } from 'express';
import {
  getAllBids,
  getUserBids,
} from '../controllers/bid.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Public/debug routes
router.get('/', getAllBids);
router.get('/user/:userId', getUserBids);

export default router;
