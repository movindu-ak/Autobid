import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  displayName: string;
  photoURL?: string;
  walletBalance: number;
  balance: number; // Legacy field
  favorites: string[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default
    },
    displayName: {
      type: String,
      required: [true, 'Display name is required'],
      trim: true,
    },
    photoURL: {
      type: String,
      default: null,
    },
    walletBalance: {
      type: Number,
      default: 5000,
      min: [0, 'Wallet balance cannot be negative'],
    },
    balance: {
      type: Number,
      default: 5000,
      min: [0, 'Balance cannot be negative'],
    },
    favorites: [{
      type: String,
      ref: 'Vehicle',
    }],
  },
  {
    timestamps: true,
  }
);

// Index for faster email lookups
userSchema.index({ email: 1 });

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  const bcrypt = require('bcryptjs');
  return await bcrypt.compare(candidatePassword, this.password);
};

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  const bcrypt = require('bcryptjs');
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Sync walletBalance and balance
userSchema.pre('save', function(next) {
  if (this.isModified('walletBalance')) {
    this.balance = this.walletBalance;
  } else if (this.isModified('balance')) {
    this.walletBalance = this.balance;
  }
  next();
});

export const User = mongoose.model<IUser>('User', userSchema);
