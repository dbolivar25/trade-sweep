// Database field limits: DECIMAL(10, 2) = max 99,999,999.99
// To ensure profit calculations don't overflow, we set a safe maximum
export const TRADE_LIMITS = {
  // Maximum price for any trade (entry or exit)
  // Set to 10M to ensure profit calculations stay well within bounds
  MAX_PRICE: 10_000_000,
  MIN_PRICE: 0.01,
  
  // Maximum quantity for trades
  MAX_QUANTITY: 1_000_000,
  MIN_QUANTITY: 0.0001,
  
  // Calculated limits
  MAX_PROFIT: 99_999_999.99,
  MIN_PROFIT: -99_999_999.99,
};

export const validateTradePrice = (price: number): { isValid: boolean; error?: string } => {
  if (isNaN(price) || price === null || price === undefined) {
    return { isValid: false, error: "Price must be a valid number" };
  }
  
  if (price < TRADE_LIMITS.MIN_PRICE) {
    return { isValid: false, error: `Price must be at least $${TRADE_LIMITS.MIN_PRICE}` };
  }
  
  if (price > TRADE_LIMITS.MAX_PRICE) {
    return { isValid: false, error: `Price cannot exceed $${TRADE_LIMITS.MAX_PRICE.toLocaleString()}` };
  }
  
  return { isValid: true };
};

export const calculateSafeProfit = (
  type: 'long' | 'short',
  entryPrice: number,
  exitPrice: number,
  quantity: number = 1
): number => {
  let profit: number;
  
  if (type === 'long') {
    profit = (exitPrice - entryPrice) * quantity;
  } else {
    profit = (entryPrice - exitPrice) * quantity;
  }
  
  // Clamp to safe bounds
  return Math.max(TRADE_LIMITS.MIN_PROFIT, Math.min(TRADE_LIMITS.MAX_PROFIT, profit));
};