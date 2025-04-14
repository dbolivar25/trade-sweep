export type TradeType = "long" | "short";

export interface TradeFormData {
  buySideLiquidity: string;
  sellSideLiquidity: string;
  fvgHigh: string;
  fvgLow: string;
  recentLimit: string;
  currentPrice: string;
}

export interface ValidationResult {
  isValid: boolean;
  message: string;
}

export interface Trade {
  id: number;
  type: string;
  entry: number;
  exit: number;
  status: string;
  time: string;
  profit: string;
}

export interface WatchlistItem {
  id: number;
  symbol: string;
  price: number;
  change: string;
}
