import mongoose, { Document, Schema } from 'mongoose';

export type BiddingType = 'upward' | 'downward';

export interface IBid extends Document {
  vehicleId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userName: string;
  userEmail: string;
  type: string; // 'upward' or 'downward'
  biddingType: BiddingType;
  amount: number;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const bidSchema = new Schema<IBid>(
  {
    vehicleId: {
      type: Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['upward', 'downward'],
      required: true,
    },
    biddingType: {
      type: String,
      enum: ['upward', 'downward'],
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Bid amount is required'],
      min: [0, 'Bid amount cannot be negative'],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
bidSchema.index({ vehicleId: 1, createdAt: -1 });
bidSchema.index({ userId: 1, createdAt: -1 });
bidSchema.index({ vehicleId: 1, userId: 1 });

export const Bid = mongoose.model<IBid>('Bid', bidSchema);
