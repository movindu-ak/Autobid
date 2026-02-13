// User and Authentication Types
export interface User {
  id: string;
  email: string;
  displayName: string;
  balance: number;
  walletBalance: number;
  photoURL?: string;
  favorites: string[];
  createdAt: Date;
}

// Vehicle Types
export type VehicleCategory = 'car' | 'bike' | 'truck' | 'suv' | 'van' | 'other';
export type BiddingType = 'upward' | 'downward';

export interface Vehicle {
  id: string;
  userId: string;
  userName: string;
  title: string;
  category: VehicleCategory;
  image: string;
  description: string;
  basePrice: number;
  suggestedStartingBid?: number; // System-suggested starting bid (from backend)
  currentPrice: number;
  biddingType: BiddingType;
  biddingDuration: number;
  biddingEndTime: Date;
  nearestCity: string;
  locationLat?: number;
  locationLng?: number;
  // Vehicle specifications
  yearOfManufacture?: string;
  mileage?: string;
  engineCapacity?: string;
  previousOwners?: number;
  fuelType?: 'Petrol' | 'Diesel' | 'CNG' | 'Hybrid' | 'Electric';
  transmissionType?: 'Manual' | 'Automatic' | 'Triptronic' | 'Other Transmission';
  sellingReason?: string; // Primary vehicle usage
  // Vehicle conditions (0-100)
  tyreCondition?: number;
  batteryCondition?: number;
  interiorCondition?: number;
  exteriorCondition?: number;
  negotiable?: boolean;
  bids: Bid[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Bidding Types
export interface Bid {
  id: string;
  vehicleId: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: string;
  biddingType: BiddingType;
  amount: number;
  timestamp: Date;
  createdAt: Date;
}

// Context Types
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  toggleFavorite: (vehicleId: string) => void;
}

export interface AppContextType {
  vehicles: Vehicle[];
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'userId' | 'userName' | 'createdAt' | 'updatedAt' | 'currentPrice' | 'bids' | 'isActive' | 'biddingEndTime'>) => void;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  placeBid: (vehicleId: string, biddingType: BiddingType, customAmount?: number) => Promise<boolean>;
  topUpBalance: (amount: number) => Promise<boolean>;
  getVehicleById: (id: string) => Vehicle | undefined;
  getUserVehicles: (userId: string) => Vehicle[];
  bids: Bid[];
}
