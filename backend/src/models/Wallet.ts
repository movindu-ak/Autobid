import mongoose, { Document, Schema } from 'mongoose';

export type TransactionType = 'deposit' | 'withdrawal' | 'bid' | 'refund';

export interface IWalletTransaction extends Document {
  userId: mongoose.Types.ObjectId;
  type: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  relatedVehicleId?: mongoose.Types.ObjectId;
  relatedBidId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const walletTransactionSchema = new Schema<IWalletTransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['deposit', 'withdrawal', 'bid', 'refund'],
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Transaction amount is required'],
    },
    balanceBefore: {
      type: Number,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    relatedVehicleId: {
      type: Schema.Types.ObjectId,
      ref: 'Vehicle',
    },
    relatedBidId: {
      type: Schema.Types.ObjectId,
      ref: 'Bid',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for wallet transaction queries
walletTransactionSchema.index({ userId: 1, createdAt: -1 });
walletTransactionSchema.index({ type: 1 });

export const WalletTransaction = mongoose.model<IWalletTransaction>(
  'WalletTransaction',
  walletTransactionSchema
);
