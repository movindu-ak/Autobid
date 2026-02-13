import { Request, Response } from 'express';
import { Vehicle } from '../models/Vehicle';
import { Bid } from '../models/Bid';
import { asyncHandler, AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { User } from '../models/User';

/**
 * @desc    Get all vehicles
 * @route   GET /api/vehicles
 * @access  Public
 */
export const getVehicles = asyncHandler(async (req: Request, res: Response) => {
  const {
    category,
    isActive,
    userId,
    search,
    sort = '-createdAt',
    limit = '50',
    page = '1',
  } = req.query;

  // Build filter
  const filter: any = {};

  if (category) filter.category = category;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (userId) filter.userId = userId;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  // Calculate pagination
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  // Get vehicles
  const vehicles = await Vehicle.find(filter)
    .sort(sort as string)
    .limit(limitNum)
    .skip(skip)
    .populate('userId', 'displayName email');

  // Get total count
  const total = await Vehicle.countDocuments(filter);

  // Get bids for each vehicle
  const vehiclesWithBids = await Promise.all(
    vehicles.map(async (vehicle) => {
      const bids = await Bid.find({ vehicleId: vehicle._id })
        .sort('-createdAt')
        .populate('userId', 'displayName email');

      return {
        id: vehicle._id,
        userId: vehicle.userId,
        userName: vehicle.userName,
        title: vehicle.title,
        category: vehicle.category,
        image: vehicle.image,
        description: vehicle.description,
        basePrice: vehicle.basePrice,
        suggestedStartingBid: vehicle.suggestedStartingBid,
        currentPrice: vehicle.currentPrice,
        biddingType: vehicle.biddingType,
        biddingDuration: vehicle.biddingDuration,
        biddingEndTime: vehicle.biddingEndTime,
        nearestCity: vehicle.nearestCity,
        locationLat: vehicle.locationLat,
        locationLng: vehicle.locationLng,
        yearOfManufacture: vehicle.yearOfManufacture,
        mileage: vehicle.mileage,
        engineCapacity: vehicle.engineCapacity,
        previousOwners: vehicle.previousOwners,
        fuelType: vehicle.fuelType,
        transmissionType: vehicle.transmissionType,
        sellingReason: vehicle.sellingReason,
        tyreCondition: vehicle.tyreCondition,
        batteryCondition: vehicle.batteryCondition,
        interiorCondition: vehicle.interiorCondition,
        exteriorCondition: vehicle.exteriorCondition,
        negotiable: vehicle.negotiable,
        isActive: vehicle.isActive,
        createdAt: vehicle.createdAt,
        updatedAt: vehicle.updatedAt,
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
      };
    })
  );

  res.status(200).json({
    success: true,
    data: {
      vehicles: vehiclesWithBids,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    },
  });
});

/**
 * @desc    Get single vehicle by ID
 * @route   GET /api/vehicles/:id
 * @access  Public
 */
export const getVehicle = asyncHandler(async (req: Request, res: Response) => {
  const vehicle = await Vehicle.findById(req.params.id).populate('userId', 'displayName email');

  if (!vehicle) {
    throw new AppError('Vehicle not found', 404);
  }

  // Get bids for this vehicle
  const bids = await Bid.find({ vehicleId: vehicle._id })
    .sort('-createdAt')
    .populate('userId', 'displayName email');

  res.status(200).json({
    success: true,
    data: {
      vehicle: {
        id: vehicle._id,
        userId: vehicle.userId,
        userName: vehicle.userName,
        title: vehicle.title,
        category: vehicle.category,
        image: vehicle.image,
        description: vehicle.description,
        basePrice: vehicle.basePrice,
        suggestedStartingBid: vehicle.suggestedStartingBid,
        currentPrice: vehicle.currentPrice,
        biddingType: vehicle.biddingType,
        biddingDuration: vehicle.biddingDuration,
        biddingEndTime: vehicle.biddingEndTime,
        nearestCity: vehicle.nearestCity,
        locationLat: vehicle.locationLat,
        locationLng: vehicle.locationLng,
        yearOfManufacture: vehicle.yearOfManufacture,
        mileage: vehicle.mileage,
        engineCapacity: vehicle.engineCapacity,
        previousOwners: vehicle.previousOwners,
        fuelType: vehicle.fuelType,
        transmissionType: vehicle.transmissionType,
        sellingReason: vehicle.sellingReason,
        tyreCondition: vehicle.tyreCondition,
        batteryCondition: vehicle.batteryCondition,
        interiorCondition: vehicle.interiorCondition,
        exteriorCondition: vehicle.exteriorCondition,
        negotiable: vehicle.negotiable,
        isActive: vehicle.isActive,
        createdAt: vehicle.createdAt,
        updatedAt: vehicle.updatedAt,
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
    },
  });
});

/**
 * @desc    Create a new vehicle
 * @route   POST /api/vehicles
 * @access  Private
 */
export const createVehicle = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user?.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Add userId and userName to request body
  const vehicleData = {
    ...req.body,
    userId: user._id,
    userName: user.displayName,
  };

  const vehicle = await Vehicle.create(vehicleData);

  res.status(201).json({
    success: true,
    message: 'Vehicle created successfully',
    data: {
      vehicle: {
        id: vehicle._id,
        userId: vehicle.userId,
        userName: vehicle.userName,
        title: vehicle.title,
        category: vehicle.category,
        image: vehicle.image,
        description: vehicle.description,
        basePrice: vehicle.basePrice,
        suggestedStartingBid: vehicle.suggestedStartingBid,
        currentPrice: vehicle.currentPrice,
        biddingType: vehicle.biddingType,
        biddingDuration: vehicle.biddingDuration,
        biddingEndTime: vehicle.biddingEndTime,
        nearestCity: vehicle.nearestCity,
        locationLat: vehicle.locationLat,
        locationLng: vehicle.locationLng,
        yearOfManufacture: vehicle.yearOfManufacture,
        mileage: vehicle.mileage,
        engineCapacity: vehicle.engineCapacity,
        previousOwners: vehicle.previousOwners,
        fuelType: vehicle.fuelType,
        transmissionType: vehicle.transmissionType,
        sellingReason: vehicle.sellingReason,
        tyreCondition: vehicle.tyreCondition,
        batteryCondition: vehicle.batteryCondition,
        interiorCondition: vehicle.interiorCondition,
        exteriorCondition: vehicle.exteriorCondition,
        negotiable: vehicle.negotiable,
        isActive: vehicle.isActive,
        createdAt: vehicle.createdAt,
        updatedAt: vehicle.updatedAt,
        bids: [],
      },
    },
  });
});

/**
 * @desc    Update vehicle
 * @route   PUT /api/vehicles/:id
 * @access  Private (Owner only)
 */
export const updateVehicle = asyncHandler(async (req: AuthRequest, res: Response) => {
  const vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    throw new AppError('Vehicle not found', 404);
  }

  // Check if user owns the vehicle
  if (vehicle.userId.toString() !== req.user?.id) {
    throw new AppError('Not authorized to update this vehicle', 403);
  }

  // Don't allow updating certain fields
  delete req.body.userId;
  delete req.body.userName;
  delete req.body.currentPrice;
  delete req.body.bids;

  const updatedVehicle = await Vehicle.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    message: 'Vehicle updated successfully',
    data: {
      vehicle: updatedVehicle,
    },
  });
});

/**
 * @desc    Delete vehicle
 * @route   DELETE /api/vehicles/:id
 * @access  Private (Owner only)
 */
export const deleteVehicle = asyncHandler(async (req: AuthRequest, res: Response) => {
  const vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    throw new AppError('Vehicle not found', 404);
  }

  // Check if user owns the vehicle
  if (vehicle.userId.toString() !== req.user?.id) {
    throw new AppError('Not authorized to delete this vehicle', 403);
  }

  // Soft delete - just set isActive to false
  vehicle.isActive = false;
  await vehicle.save();

  res.status(200).json({
    success: true,
    message: 'Vehicle deleted successfully',
  });
});

/**
 * @desc    Get user's vehicles
 * @route   GET /api/vehicles/user/:userId
 * @access  Public
 */
export const getUserVehicles = asyncHandler(async (req: Request, res: Response) => {
  const vehicles = await Vehicle.find({ userId: req.params.userId })
    .sort('-createdAt')
    .populate('userId', 'displayName email');

  // Get bids for each vehicle
  const vehiclesWithBids = await Promise.all(
    vehicles.map(async (vehicle) => {
      const bids = await Bid.find({ vehicleId: vehicle._id })
        .sort('-createdAt')
        .populate('userId', 'displayName email');

      return {
        id: vehicle._id,
        ...vehicle.toObject(),
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
      };
    })
  );

  res.status(200).json({
    success: true,
    data: {
      vehicles: vehiclesWithBids,
    },
  });
});
