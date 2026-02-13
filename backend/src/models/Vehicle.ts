import mongoose, { Document, Schema } from 'mongoose';

export type VehicleCategory = 'car' | 'bike' | 'truck' | 'suv' | 'van' | 'other';
export type BiddingType = 'upward' | 'downward';
export type FuelType = 'Petrol' | 'Diesel' | 'CNG' | 'Hybrid' | 'Electric';
export type TransmissionType = 'Manual' | 'Automatic' | 'Triptronic' | 'Other Transmission';

export interface IVehicle extends Document {
  userId: mongoose.Types.ObjectId;
  userName: string;
  title: string;
  category: VehicleCategory;
  image: string;
  description: string;
  basePrice: number;
  suggestedStartingBid: number;
  currentPrice: number;
  biddingType: BiddingType;
  biddingDuration: number;
  biddingEndTime: Date;
  nearestCity: string;
  locationLat?: number;
  locationLng?: number;
  yearOfManufacture?: string;
  mileage?: string;
  engineCapacity?: string;
  previousOwners?: number;
  fuelType?: FuelType;
  transmissionType?: TransmissionType;
  sellingReason?: string;
  tyreCondition?: number;
  batteryCondition?: number;
  interiorCondition?: number;
  exteriorCondition?: number;
  negotiable: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const vehicleSchema = new Schema<IVehicle>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Vehicle title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
    },
    category: {
      type: String,
      enum: ['car', 'bike', 'truck', 'suv', 'van', 'other'],
      required: [true, 'Category is required'],
    },
    image: {
      type: String,
      required: [true, 'Vehicle image is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      minlength: [20, 'Description must be at least 20 characters'],
    },
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Price cannot be negative'],
    },
    suggestedStartingBid: {
      type: Number,
      required: true,
    },
    currentPrice: {
      type: Number,
      required: true,
    },
    biddingType: {
      type: String,
      enum: ['upward', 'downward'],
      default: 'upward',
    },
    biddingDuration: {
      type: Number,
      required: [true, 'Bidding duration is required'],
      min: [1, 'Duration must be at least 1 day'],
      max: [30, 'Duration cannot exceed 30 days'],
    },
    biddingEndTime: {
      type: Date,
      required: true,
    },
    nearestCity: {
      type: String,
      required: [true, 'Nearest city is required'],
    },
    locationLat: Number,
    locationLng: Number,
    yearOfManufacture: String,
    mileage: String,
    engineCapacity: String,
    previousOwners: {
      type: Number,
      min: 0,
    },
    fuelType: {
      type: String,
      enum: ['Petrol', 'Diesel', 'CNG', 'Hybrid', 'Electric'],
    },
    transmissionType: {
      type: String,
      enum: ['Manual', 'Automatic', 'Triptronic', 'Other Transmission'],
    },
    sellingReason: String,
    tyreCondition: {
      type: Number,
      min: 0,
      max: 100,
    },
    batteryCondition: {
      type: Number,
      min: 0,
      max: 100,
    },
    interiorCondition: {
      type: Number,
      min: 0,
      max: 100,
    },
    exteriorCondition: {
      type: Number,
      min: 0,
      max: 100,
    },
    negotiable: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
vehicleSchema.index({ userId: 1 });
vehicleSchema.index({ category: 1 });
vehicleSchema.index({ isActive: 1 });
vehicleSchema.index({ biddingEndTime: 1 });
vehicleSchema.index({ createdAt: -1 });

// Calculate suggested starting bid before saving (15% lower than base price)
vehicleSchema.pre('save', function(next) {
  if (this.isNew) {
    this.suggestedStartingBid = Math.floor(this.basePrice * 0.85);
    this.currentPrice = this.suggestedStartingBid;
    
    // Calculate bidding end time
    const endTime = new Date();
    endTime.setDate(endTime.getDate() + this.biddingDuration);
    this.biddingEndTime = endTime;
  }
  next();
});

export const Vehicle = mongoose.model<IVehicle>('Vehicle', vehicleSchema);
