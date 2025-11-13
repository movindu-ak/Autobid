import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Vehicle, AppContextType, BiddingType, Bid } from '../types/index';
import { mockVehicles } from '../data/mockData';
import { calculateNewBidPrice, generateId, calculateBiddingEndTime } from '../utils/helpers';
import { useAuth } from './AuthContext';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

const BID_COST = 50; // Rs. 50 per bid

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  // Load vehicles from localStorage or use mock data
  useEffect(() => {
    const storedVehicles = localStorage.getItem('vehicles');
    const dataVersion = localStorage.getItem('dataVersion');
    const currentVersion = '3.0'; // Update this when mockData changes
    
    if (storedVehicles && dataVersion === currentVersion) {
      try {
        const parsed = JSON.parse(storedVehicles);
        setVehicles(
          parsed.map((v: any) => ({
            ...v,
            createdAt: new Date(v.createdAt),
            updatedAt: new Date(v.updatedAt),
            biddingEndTime: v.biddingEndTime ? new Date(v.biddingEndTime) : new Date(),
            bids: Array.isArray(v.bids) ? v.bids.map((b: any) => ({
              ...b,
              timestamp: b.timestamp ? new Date(b.timestamp) : new Date(),
              createdAt: b.createdAt ? new Date(b.createdAt) : new Date(),
            })) : [],
          }))
        );
      } catch (error) {
        console.error('Error parsing stored vehicles:', error);
        setVehicles(mockVehicles);
        localStorage.setItem('vehicles', JSON.stringify(mockVehicles));
        localStorage.setItem('dataVersion', currentVersion);
      }
    } else {
      // Load fresh mock data
      setVehicles(mockVehicles);
      localStorage.setItem('vehicles', JSON.stringify(mockVehicles));
      localStorage.setItem('dataVersion', currentVersion);
    }
  }, []);

  // Save vehicles to localStorage whenever they change
  useEffect(() => {
    if (vehicles.length > 0) {
      localStorage.setItem('vehicles', JSON.stringify(vehicles));
    }
  }, [vehicles]);

  const addVehicle = (vehicleData: Omit<Vehicle, 'id' | 'userId' | 'userName' | 'createdAt' | 'updatedAt' | 'currentPrice' | 'bids' | 'isActive' | 'biddingEndTime'>) => {
    if (!user) return;

    // Calculate system-suggested starting bid (15% lower than base price)
    const suggestedStartingBid = Math.floor(vehicleData.basePrice * 0.85);

    const newVehicle: Vehicle = {
      ...vehicleData,
      id: generateId(),
      userId: user.id,
      userName: user.displayName,
      suggestedStartingBid: suggestedStartingBid,
      currentPrice: suggestedStartingBid, // Start bidding from suggested price
      isActive: true,
      bids: [],
      biddingEndTime: calculateBiddingEndTime(vehicleData.biddingDuration),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setVehicles((prev) => [newVehicle, ...prev]);
  };

  const updateVehicle = (id: string, updates: Partial<Vehicle>) => {
    setVehicles((prev) =>
      prev.map((vehicle) =>
        vehicle.id === id
          ? { ...vehicle, ...updates, updatedAt: new Date() }
          : vehicle
      )
    );
  };

  const placeBid = async (vehicleId: string, biddingType: BiddingType): Promise<boolean> => {
    if (!user) return false;

    const vehicle = vehicles.find((v) => v.id === vehicleId);
    if (!vehicle) return false;

    // Check if user has enough balance
    if (user.balance < BID_COST) {
      alert('Insufficient balance! Please top up your wallet.');
      return false;
    }

    // Check if user has previous bids on THIS vehicle
    const userPreviousBids = vehicle.bids.filter(bid => bid.userId === user.id);
    
    if (userPreviousBids.length > 0) {
      // Get the user's last bid type on THIS vehicle
      const lastBidType = userPreviousBids[userPreviousBids.length - 1].type;
      
      // If user previously bid upward on THIS vehicle, they can ONLY bid upward on THIS vehicle
      if (lastBidType === 'upward' && biddingType === 'downward') {
        alert('You cannot switch to downward bidding on this vehicle after placing an upward bid. You can only continue bidding upward on this vehicle.');
        return false;
      }
      
      // If user previously bid downward on THIS vehicle, they can ONLY bid downward on THIS vehicle
      if (lastBidType === 'downward' && biddingType === 'upward') {
        alert('You cannot switch to upward bidding on this vehicle after placing a downward bid. You can only continue bidding downward on this vehicle.');
        return false;
      }
    }

    // Calculate new price
    const newPrice = calculateNewBidPrice(vehicle.currentPrice, biddingType);
    
    // Get the starting bid price (system suggested price)
    const startingBidPrice = vehicle.suggestedStartingBid || vehicle.basePrice;

    // Create bid
    const newBid: Bid = {
      id: generateId(),
      vehicleId,
      userId: user.id,
      userName: user.displayName,
      userEmail: user.email,
      type: biddingType,
      amount: newPrice,
      biddingType,
      timestamp: new Date(),
      createdAt: new Date(),
    };

    // Update vehicle - Only update currentPrice if bid is ABOVE starting price
    // Downgrade bids (below starting price) don't affect the current price
    const shouldUpdatePrice = newPrice > startingBidPrice;
    
    updateVehicle(vehicleId, {
      currentPrice: shouldUpdatePrice ? newPrice : vehicle.currentPrice,
      bids: [...vehicle.bids, newBid],
    });

    // Deduct bid cost from user balance
    const updatedUser = { ...user, balance: user.balance - BID_COST };
    localStorage.setItem(`user_${user.id}`, JSON.stringify(updatedUser));
    
    // Force re-render by updating auth context
    window.location.reload();

    return true;
  };

  const topUpBalance = async (amount: number): Promise<boolean> => {
    if (!user) return false;

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Update user balance
    const updatedUser = { ...user, balance: user.balance + amount };
    localStorage.setItem(`user_${user.id}`, JSON.stringify(updatedUser));
    
    // Force re-render
    window.location.reload();

    return true;
  };

  const getVehicleById = (id: string): Vehicle | undefined => {
    return vehicles.find((v) => v.id === id);
  };

  const getUserVehicles = (userId: string): Vehicle[] => {
    return vehicles.filter((v) => v.userId === userId);
  };

  // Get all bids from all vehicles
  const allBids = vehicles.flatMap((v) => v.bids);

  const value: AppContextType = {
    vehicles,
    addVehicle,
    updateVehicle,
    placeBid,
    topUpBalance,
    getVehicleById,
    getUserVehicles,
    bids: allBids,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
