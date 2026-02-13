import type { BiddingType } from '../types/index';

// Generate unique ID
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Calculate bidding end time
export const calculateBiddingEndTime = (durationInDays: number): Date => {
  const endTime = new Date();
  endTime.setDate(endTime.getDate() + durationInDays);
  return endTime;
};

// Calculate the new bid price based on the current price and bidding type (1% change)
export const calculateNewBidPrice = (currentPrice: number, biddingType: BiddingType): number => {
  const changeAmount = currentPrice * 0.01;
  if (biddingType === 'upward') {
    return Math.round(currentPrice + changeAmount);
  } else {
    return Math.round(currentPrice - changeAmount);
  }
};

// Alias for calculateNewBidPrice (used in VehicleDetail)
export const calculateNewBidAmount = calculateNewBidPrice;

// Calculate bid amount with specific percentage (rounded to nearest 5000)
export const calculateBidAmountWithPercentage = (
  currentPrice: number,
  percentage: number,
  _biddingType: BiddingType
): number => {
  const changeAmount = currentPrice * percentage;
  const roundedAmount = Math.round(changeAmount / 5000) * 5000;
  
  if (_biddingType === 'upward') {
    return currentPrice + roundedAmount;
  } else {
    return currentPrice - roundedAmount;
  }
};

// Calculate suggested bid amount (0.75% of current price, rounded to nearest 5000)
export const calculateSuggestedBidAmount = (currentPrice: number): number => {
  const suggestedChange = currentPrice * 0.0075; // 0.75% as middle ground
  const roundedAmount = Math.round(suggestedChange / 5000) * 5000;
  
  // Ensure at least 5000
  return Math.max(5000, roundedAmount);
};

// Calculate percentage change
export const calculatePercentageChange = (basePrice: number, currentPrice: number): number => {
  if (basePrice === 0) return 0;
  const change = ((currentPrice - basePrice) / basePrice) * 100;
  return Math.round(change * 100) / 100;
};

// Format currency
export const formatCurrency = (amount: number): string => {
  return `Rs. ${amount.toLocaleString()}`;
};

// Validate custom bid amount
export const isValidCustomBidAmount = (
  amount: number,
  currentPrice: number,
  _biddingType: BiddingType
): { valid: boolean; error?: string } => {
  if (amount % 5000 !== 0) {
    return { valid: false, error: 'Amount must be a multiple of Rs. 5,000' };
  }

  const minChange = currentPrice * 0.005; // 0.5%
  const maxChange = currentPrice * 0.01;  // 1%
  
  if (amount < minChange) {
    return {
      valid: false,
      error: `Amount must be at least 0.5% of current price (Rs. ${Math.ceil(minChange / 5000) * 5000}.toLocaleString()})`,
    };
  }
  
  if (amount > maxChange) {
    return {
      valid: false,
      error: `Amount cannot exceed 1% of current price (Rs. ${Math.floor(maxChange / 5000) * 5000}.toLocaleString()})`,
    };
  }

  return { valid: true };
};

// Calculate new bid amount based on custom amount
export const calculateCustomBidAmount = (
  currentPrice: number,
  customAmount: number,
  biddingType: BiddingType
): number => {
  if (biddingType === 'upward') {
    return currentPrice + customAmount;
  } else {
    return currentPrice - customAmount;
  }
};

// Format time remaining
export const formatTimeRemaining = (endTime: Date | string | undefined): string => {
  if (!endTime) return 'N/A';
  
  const endDate = typeof endTime === 'string' ? new Date(endTime) : endTime;
  
  if (isNaN(endDate.getTime())) return 'Invalid Date';
  
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();

  if (diff <= 0) return 'Ended';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

// Format date
export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Format price
export const formatPrice = (price: number): string => {
  if (price === undefined || price === null || isNaN(price)) {
    return 'Rs. 0';
  }
  return `Rs. ${price.toLocaleString()}`;
};
