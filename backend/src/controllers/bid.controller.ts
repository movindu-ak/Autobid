import { Request, Response } from 'express';
import { Bid } from '../models/Bid';
import { Vehicle } from '../models/Vehicle';
import { User } from '../models/User';
import { WalletTransaction } from '../models/Wallet';
import { asyncHandler, AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { calculateNewBidPrice, validateBidAmount, BID_COST, isBiddingActive } from '../utils/price';
import { emitNewBid, emitPriceUpdate } from '../config/socket';

/**
 * @desc    Place a bid on a vehicle
 * @route   POST /api/vehicles/:id/bid
 * @access  Private
 */
export const placeBid = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { biddingType, customAmount } = req.body;
  const vehicleId = req.params.id;

  // Get user
  const user = await User.findById(req.user?.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Get vehicle
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    throw new AppError('Vehicle not found', 404);
  }

  // Check if vehicle is active
  if (!vehicle.isActive) {
    throw new AppError('This vehicle is no longer active', 400);
  }

  // Check if bidding time has ended
  if (!isBiddingActive(vehicle.biddingEndTime)) {
    throw new AppError('Bidding has ended for this vehicle', 400);
  }

  // Check if user is the owner
  if (vehicle.userId.toString() === user._id.toString()) {
    throw new AppError('You cannot bid on your own vehicle', 400);
  }

  // Check if user has sufficient balance
  if (user.walletBalance < BID_COST) {
    throw new AppError(`Insufficient balance. Each bid costs Rs. ${BID_COST}`, 400);
  }

  // Get user's previous bids on this vehicle
  const userPreviousBids = await Bid.find({
    vehicleId: vehicle._id,
    userId: user._id,
  }).sort('-createdAt');

  // Check if user is locked to a bidding direction
  if (userPreviousBids.length > 0) {
    const lastBidType = userPreviousBids[0].type;
    if (lastBidType !== biddingType) {
      throw new AppError(
        `You are locked to ${lastBidType} bidding for this vehicle`,
        400
      );
    }
  }

  // Calculate bid amount
  const bidAmount = customAmount || calculateNewBidPrice(
    vehicle.currentPrice,
    biddingType,
    customAmount
  );

  // Validate bid amount
  const validation = validateBidAmount(
    bidAmount,
    vehicle.currentPrice,
    biddingType,
    vehicle.suggestedStartingBid
  );

  if (!validation.isValid) {
    throw new AppError(validation.error || 'Invalid bid amount', 400);
  }

  // Deduct bid cost from user's wallet
  const balanceBefore = user.walletBalance;
  user.walletBalance -= BID_COST;
  user.balance = user.walletBalance;
  await user.save();

  // Create wallet transaction
  await WalletTransaction.create({
    userId: user._id,
    type: 'bid',
    amount: -BID_COST,
    balanceBefore,
    balanceAfter: user.walletBalance,
    description: `Bid placed on ${vehicle.title}`,
    relatedVehicleId: vehicle._id,
  });

  // Create bid
  const bid = await Bid.create({
    vehicleId: vehicle._id,
    userId: user._id,
    userName: user.displayName,
    userEmail: user.email,
    type: biddingType,
    biddingType,
    amount: bidAmount,
    timestamp: new Date(),
  });

  // Update vehicle current price
  vehicle.currentPrice = bidAmount;
  await vehicle.save();

  // Emit real-time updates via Socket.io
  emitNewBid(vehicleId, {
    bid: {
      id: bid._id,
      vehicleId: bid.vehicleId,
      userId: bid.userId,
      userName: bid.userName,
      userEmail: bid.userEmail,
      type: bid.type,
      biddingType: bid.biddingType,
      amount: bid.amount,
      timestamp: bid.timestamp,
      createdAt: bid.createdAt,
    },
  });

  emitPriceUpdate(vehicleId, {
    currentPrice: vehicle.currentPrice,
    vehicleId: vehicle._id,
  });

  res.status(201).json({
    success: true,
    message: 'Bid placed successfully',
    data: {
      bid: {
        id: bid._id,
        vehicleId: bid.vehicleId,
        userId: bid.userId,
        userName: bid.userName,
        userEmail: bid.userEmail,
        type: bid.type,
        biddingType: bid.biddingType,
        amount: bid.amount,
        timestamp: bid.timestamp,
        createdAt: bid.createdAt,
      },
      vehicle: {
        id: vehicle._id,
        currentPrice: vehicle.currentPrice,
      },
      user: {
        walletBalance: user.walletBalance,
        balance: user.balance,
      },
    },
  });
});

/**
 * @desc    Get all bids for a vehicle
 * @route   GET /api/vehicles/:id/bids
 * @access  Public
 */
export const getVehicleBids = asyncHandler(async (req: Request, res: Response) => {
  const vehicleId = req.params.id;

  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    throw new AppError('Vehicle not found', 404);
  }

  const bids = await Bid.find({ vehicleId })
    .sort('-createdAt')
    .populate('userId', 'displayName email photoURL');

  res.status(200).json({
    success: true,
    data: {
      bids: bids.map((bid) => ({
        id: bid._id,
        vehicleId: bid.vehicleId,
        userId: bid.userId,
        userName: bid.userName,
        userEmail: bid.userEmail,
        type: bid.type,
        biddingType: bid.biddingType,
        amount: bid.amount,
        timestamp: bid.timestamp,
        createdAt: bid.createdAt,
      })),
    },
  });
});

/**
 * @desc    Get user's bids
 * @route   GET /api/bids/user/:userId
 * @access  Public
 */
export const getUserBids = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.params.userId;

  const bids = await Bid.find({ userId })
    .sort('-createdAt')
    .populate('vehicleId')
    .populate('userId', 'displayName email photoURL');

  res.status(200).json({
    success: true,
    data: {
      bids: bids.map((bid) => ({
        id: bid._id,
        vehicleId: bid.vehicleId,
        userId: bid.userId,
        userName: bid.userName,
        userEmail: bid.userEmail,
        type: bid.type,
        biddingType: bid.biddingType,
        amount: bid.amount,
        timestamp: bid.timestamp,
        createdAt: bid.createdAt,
      })),
    },
  });
});

/**
 * @desc    Get all bids (admin/debug)
 * @route   GET /api/bids
 * @access  Public
 */
export const getAllBids = asyncHandler(async (req: Request, res: Response) => {
  const { limit = '100', page = '1' } = req.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  const bids = await Bid.find()
    .sort('-createdAt')
    .limit(limitNum)
    .skip(skip)
    .populate('vehicleId', 'title category image')
    .populate('userId', 'displayName email');

  const total = await Bid.countDocuments();

  res.status(200).json({
    success: true,
    data: {
      bids: bids.map((bid) => ({
        id: bid._id,
        vehicleId: bid.vehicleId,
        userId: bid.userId,
        userName: bid.userName,
        userEmail: bid.userEmail,
        type: bid.type,
        biddingType: bid.biddingType,
        amount: bid.amount,
        timestamp: bid.timestamp,
        createdAt: bid.createdAt,
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    },
  });
});
