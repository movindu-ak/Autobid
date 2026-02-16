import { Request, Response } from 'express';
import { User } from '../models/User';
import { generateToken } from '../utils/jwt';
import { asyncHandler, AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, displayName } = req.body;

  // Validate input
  if (!email || !password || !displayName) {
    throw new AppError('Please provide email, password, and display name', 400);
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('User with this email already exists', 400);
  }

  // Create user
  const user = await User.create({
    email,
    password,
    displayName,
    walletBalance: 5000, // Initial balance
    balance: 5000,
    favorites: [],
  });

  // Generate token
  const token = generateToken({
    userId: user._id.toString(),
    email: user.email,
  });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      token,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        walletBalance: user.walletBalance,
        balance: user.balance,
        favorites: user.favorites,
        photoURL: user.photoURL,
        createdAt: user.createdAt,
      },
    },
  });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    throw new AppError('Please provide email and password', 400);
  }

  // Find user and include password
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // Check password
  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  // Generate token
  const token = generateToken({
    userId: user._id.toString(),
    email: user.email,
  });

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      token,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        walletBalance: user.walletBalance,
        balance: user.balance,
        favorites: user.favorites,
        photoURL: user.photoURL,
        createdAt: user.createdAt,
      },
    },
  });
});

/**
 * @desc    Google OAuth login/signup
 * @route   POST /api/auth/google
 * @access  Public
 */
export const googleAuth = asyncHandler(async (req: Request, res: Response) => {
  const { email, displayName, photoURL, googleId } = req.body;

  // Validate input
  if (!email || !displayName) {
    throw new AppError('Please provide email and display name', 400);
  }

  // Check if user already exists
  let user = await User.findOne({ email });

  if (!user) {
    // Create new user with Google auth (no password required)
    user = await User.create({
      email,
      displayName,
      photoURL,
      password: `google_${googleId}_${Date.now()}`, // Random password for Google users
      walletBalance: 5000,
      balance: 5000,
      favorites: [],
    });
  }

  // Generate token
  const token = generateToken({
    userId: user._id.toString(),
    email: user.email,
  });

  res.status(200).json({
    success: true,
    message: 'Google authentication successful',
    data: {
      token,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        walletBalance: user.walletBalance,
        balance: user.balance,
        favorites: user.favorites,
        photoURL: user.photoURL,
        createdAt: user.createdAt,
      },
    },
  });
});

/**
 * @desc    Get current logged-in user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user?.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        walletBalance: user.walletBalance,
        balance: user.balance,
        favorites: user.favorites,
        photoURL: user.photoURL,
        createdAt: user.createdAt,
      },
    },
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { displayName, photoURL } = req.body;

  const user = await User.findById(req.user?.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (displayName) user.displayName = displayName;
  if (photoURL !== undefined) user.photoURL = photoURL;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        walletBalance: user.walletBalance,
        balance: user.balance,
        favorites: user.favorites,
        photoURL: user.photoURL,
        createdAt: user.createdAt,
      },
    },
  });
});

/**
 * @desc    Toggle vehicle favorite
 * @route   POST /api/auth/favorites/:vehicleId
 * @access  Private
 */
export const toggleFavorite = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { vehicleId } = req.params;

  const user = await User.findById(req.user?.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const favoriteIndex = user.favorites.indexOf(vehicleId);

  if (favoriteIndex > -1) {
    // Remove from favorites
    user.favorites.splice(favoriteIndex, 1);
  } else {
    // Add to favorites
    user.favorites.push(vehicleId);
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: favoriteIndex > -1 ? 'Removed from favorites' : 'Added to favorites',
    data: {
      favorites: user.favorites,
    },
  });
});
