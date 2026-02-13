import { Request, Response } from 'express';
import { User } from '../models/User';
import { WalletTransaction } from '../models/Wallet';
import { asyncHandler, AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';

/**
 * @desc    Get wallet balance
 * @route   GET /api/wallet/balance
 * @access  Private
 */
export const getBalance = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user?.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    data: {
      walletBalance: user.walletBalance,
      balance: user.balance,
    },
  });
});

/**
 * @desc    Top up wallet
 * @route   POST /api/wallet/topup
 * @access  Private
 */
export const topUpWallet = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    throw new AppError('Please provide a valid amount', 400);
  }

  if (amount < 100) {
    throw new AppError('Minimum top-up amount is Rs. 100', 400);
  }

  if (amount > 100000) {
    throw new AppError('Maximum top-up amount is Rs. 100,000', 400);
  }

  const user = await User.findById(req.user?.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const balanceBefore = user.walletBalance;
  user.walletBalance += amount;
  user.balance = user.walletBalance;
  await user.save();

  // Create wallet transaction
  await WalletTransaction.create({
    userId: user._id,
    type: 'deposit',
    amount,
    balanceBefore,
    balanceAfter: user.walletBalance,
    description: `Wallet top-up of Rs. ${amount.toLocaleString()}`,
  });

  res.status(200).json({
    success: true,
    message: `Wallet topped up successfully with Rs. ${amount.toLocaleString()}`,
    data: {
      walletBalance: user.walletBalance,
      balance: user.balance,
      amountAdded: amount,
    },
  });
});

/**
 * @desc    Get wallet transactions
 * @route   GET /api/wallet/transactions
 * @access  Private
 */
export const getTransactions = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { limit = '50', page = '1', type } = req.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  // Build filter
  const filter: any = { userId: req.user?.id };
  if (type) {
    filter.type = type;
  }

  const transactions = await WalletTransaction.find(filter)
    .sort('-createdAt')
    .limit(limitNum)
    .skip(skip)
    .populate('relatedVehicleId', 'title image category')
    .populate('relatedBidId');

  const total = await WalletTransaction.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: {
      transactions: transactions.map((txn) => ({
        id: txn._id,
        userId: txn.userId,
        type: txn.type,
        amount: txn.amount,
        balanceBefore: txn.balanceBefore,
        balanceAfter: txn.balanceAfter,
        description: txn.description,
        relatedVehicleId: txn.relatedVehicleId,
        relatedBidId: txn.relatedBidId,
        createdAt: txn.createdAt,
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

/**
 * @desc    Withdraw from wallet (future feature)
 * @route   POST /api/wallet/withdraw
 * @access  Private
 */
export const withdrawFromWallet = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    throw new AppError('Please provide a valid amount', 400);
  }

  const user = await User.findById(req.user?.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.walletBalance < amount) {
    throw new AppError('Insufficient balance', 400);
  }

  const balanceBefore = user.walletBalance;
  user.walletBalance -= amount;
  user.balance = user.walletBalance;
  await user.save();

  // Create wallet transaction
  await WalletTransaction.create({
    userId: user._id,
    type: 'withdrawal',
    amount: -amount,
    balanceBefore,
    balanceAfter: user.walletBalance,
    description: `Withdrawal of Rs. ${amount.toLocaleString()}`,
  });

  res.status(200).json({
    success: true,
    message: `Withdrawal successful`,
    data: {
      walletBalance: user.walletBalance,
      balance: user.balance,
      amountWithdrawn: amount,
    },
  });
});

/**
 * @desc    Get wallet summary
 * @route   GET /api/wallet/summary
 * @access  Private
 */
export const getWalletSummary = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user?.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Get transaction stats
  const transactions = await WalletTransaction.find({ userId: user._id });

  const totalDeposits = transactions
    .filter((txn) => txn.type === 'deposit')
    .reduce((sum, txn) => sum + txn.amount, 0);

  const totalBids = transactions
    .filter((txn) => txn.type === 'bid')
    .reduce((sum, txn) => sum + Math.abs(txn.amount), 0);

  const totalWithdrawals = transactions
    .filter((txn) => txn.type === 'withdrawal')
    .reduce((sum, txn) => sum + Math.abs(txn.amount), 0);

  const totalRefunds = transactions
    .filter((txn) => txn.type === 'refund')
    .reduce((sum, txn) => sum + txn.amount, 0);

  res.status(200).json({
    success: true,
    data: {
      currentBalance: user.walletBalance,
      totalDeposits,
      totalBids,
      totalWithdrawals,
      totalRefunds,
      transactionCount: transactions.length,
    },
  });
});
