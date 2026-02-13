import { Router } from 'express';
import {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getUserVehicles,
} from '../controllers/vehicle.controller';
import { placeBid, getVehicleBids } from '../controllers/bid.controller';
import { protect, optionalAuth } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/', optionalAuth, getVehicles);
router.get('/user/:userId', getUserVehicles);
router.get('/:id', getVehicle);
router.get('/:id/bids', getVehicleBids);

// Protected routes
router.post('/', protect, createVehicle);
router.put('/:id', protect, updateVehicle);
router.delete('/:id', protect, deleteVehicle);
router.post('/:id/bid', protect, placeBid);

export default router;
