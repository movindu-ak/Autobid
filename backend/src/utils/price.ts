import { BiddingType } from '../models/Vehicle';

// Bid increment/decrement step (Rs. 10,000)
const BID_STEP = 10000;

// Bid cost per action (Rs. 50)
export const BID_COST = 50;

/**
 * Calculate the next suggested bid amount based on bidding type
 * @param currentPrice - Current price of the vehicle
 * @param biddingType - Type of bidding (upward or downward)
 * @param customAmount - Optional custom amount
 * @returns Calculated bid amount
 */
export const calculateNewBidPrice = (
  currentPrice: number,
  biddingType: BiddingType,
  customAmount?: number
): number => {
  if (customAmount !== undefined && customAmount > 0) {
    return customAmount;
  }

  if (biddingType === 'upward') {
    return currentPrice + BID_STEP;
  } else {
    // Downward bidding - decrease by step, but don't go below 0
    return Math.max(0, currentPrice - BID_STEP);
  }
};

/**
 * Validate if a bid amount is valid for the given vehicle
 * @param bidAmount - Proposed bid amount
 * @param currentPrice - Current price of the vehicle
 * @param biddingType - Type of bidding
 * @param suggestedStartingBid - System suggested starting bid
 * @returns Object with isValid flag and error message if invalid
 */
export const validateBidAmount = (
  bidAmount: number,
  currentPrice: number,
  biddingType: BiddingType,
  suggestedStartingBid: number
): { isValid: boolean; error?: string } => {
  // Bid amount must be positive
  if (bidAmount <= 0) {
    return { isValid: false, error: 'Bid amount must be positive' };
  }

  // For upward bidding
  if (biddingType === 'upward') {
    // Bid must be higher than current price
    if (bidAmount <= currentPrice) {
      return {
        isValid: false,
        error: `Upward bid must be higher than current price (Rs. ${currentPrice.toLocaleString()})`,
      };
    }

    // Minimum increment check (at least BID_STEP higher)
    const minimumBid = currentPrice + BID_STEP;
    if (bidAmount < minimumBid) {
      return {
        isValid: false,
        error: `Minimum upward bid is Rs. ${minimumBid.toLocaleString()}`,
      };
    }
  }

  // For downward bidding
  if (biddingType === 'downward') {
    // Bid must be lower than current price
    if (bidAmount >= currentPrice) {
      return {
        isValid: false,
        error: `Downward bid must be lower than current price (Rs. ${currentPrice.toLocaleString()})`,
      };
    }

    // Bid cannot be lower than suggested starting bid
    if (bidAmount < suggestedStartingBid) {
      return {
        isValid: false,
        error: `Bid cannot be lower than suggested starting bid (Rs. ${suggestedStartingBid.toLocaleString()})`,
      };
    }

    // Maximum decrement check (at most BID_STEP lower)
    const maximumBid = currentPrice - BID_STEP;
    if (bidAmount > maximumBid) {
      return {
        isValid: false,
        error: `Maximum downward bid is Rs. ${maximumBid.toLocaleString()}`,
      };
    }
  }

  return { isValid: true };
};

/**
 * Calculate bidding end time based on duration in days
 * @param durationInDays - Number of days for bidding
 * @returns Date object for bidding end time
 */
export const calculateBiddingEndTime = (durationInDays: number): Date => {
  const endTime = new Date();
  endTime.setDate(endTime.getDate() + durationInDays);
  return endTime;
};

/**
 * Check if bidding is still active for a vehicle
 * @param biddingEndTime - End time of bidding
 * @returns Boolean indicating if bidding is active
 */
export const isBiddingActive = (biddingEndTime: Date): boolean => {
  return new Date() < new Date(biddingEndTime);
};

/**
 * Format time remaining for bidding
 * @param biddingEndTime - End time of bidding
 * @returns Formatted string
 */
export const formatTimeRemaining = (biddingEndTime: Date): string => {
  const now = new Date();
  const end = new Date(biddingEndTime);
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) {
    return 'Ended';
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};
