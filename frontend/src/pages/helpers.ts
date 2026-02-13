import type { BiddingType } from '../types/index';

// Calculate bidding end time
export const calculateBiddingEndTime = (durationInDays: number): Date => {
  const endTime = new Date();
  endTime.setDate(endTime.getDate() + durationInDays);
  return endTime;
};

// Calculate the new bid price based on the current price and bidding type
// Increases or decreases by 1% of the current price
export const calculateNewBidPrice = (currentPrice: number, biddingType: BiddingType): number => {
  const changeAmount = currentPrice * 0.01;
  if (biddingType === 'upward') {
    return Math.round(currentPrice + changeAmount);
  } else {
    return Math.round(currentPrice - changeAmount);
  }
};

// Calculate percentage change
export const calculatePercentageChange = (basePrice: number, currentPrice: number): number => {
  if (basePrice === 0) return 0;
  const change = ((currentPrice - basePrice) / basePrice) * 100;
  return Math.round(change * 100) / 100; // Round to 2 decimal places
};

// Format currency
export const formatCurrency = (amount: number): string => {
  return `Rs. ${amount.toLocaleString()}`;
};

// Validate custom bid amount
// Must be a multiple of 5000 and not exceed 1% of the current price
export const isValidCustomBidAmount = (
  amount: number,
  currentPrice: number,
  biddingType: BiddingType
): { valid: boolean; error?: string } => {
  if (amount % 5000 !== 0) {
    return { valid: false, error: 'Amount must be a multiple of Rs. 5,000' };
  }

  const maxChange = currentPrice * 0.01;
  if (amount > maxChange) {
    return {
      valid: false,
      error: `Amount cannot exceed 1% of current price (Rs. ${Math.floor(maxChange).toLocaleString()})`,
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
export const formatTimeRemaining = (endTime: Date): string => {
  const now = new Date();
  const diff = endTime.getTime() - now.getTime();

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
  return `Rs. ${price.toLocaleString()}`;
};