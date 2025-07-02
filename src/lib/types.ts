import { z } from "zod";

export type TradeType = "long" | "short";

export const tradeValidationFormSchema = z.object({
  buySideLiquidity: z.string().optional(),
  sellSideLiquidity: z.string().optional(),
  fvgHigh: z.string().min(1, { message: "FVG High is required" })
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0.01 && num <= 10_000_000;
    }, { message: "FVG High must be between $0.01 and $10,000,000" }),
  fvgLow: z.string().min(1, { message: "FVG Low is required" })
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0.01 && num <= 10_000_000;
    }, { message: "FVG Low must be between $0.01 and $10,000,000" }),
  recentLimit: z.string().min(1, { message: "Recent limit is required" })
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0.01 && num <= 10_000_000;
    }, { message: "Recent limit must be between $0.01 and $10,000,000" }),
  currentPrice: z.string().min(1, { message: "Current price is required" })
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0.01 && num <= 10_000_000;
    }, { message: "Current price must be between $0.01 and $10,000,000" }),
});

export type TradeValidationFormSchema = z.infer<
  typeof tradeValidationFormSchema
>;

export interface ValidationResult {
  isValid: boolean;
  message: string;
}

export interface Trade {
  id: string;
  user_id: string;
  symbol: string;
  type: 'long' | 'short';
  status: 'pending' | 'completed';
  
  // Prices
  entry_price: number;
  exit_price?: number;
  quantity: number;
  
  // Validation data
  fvg_high: number;
  fvg_low: number;
  recent_limit: number;
  buy_side_liquidity?: number;
  sell_side_liquidity?: number;
  
  // Calculated
  profit?: number;
  profit_percent?: number;
  
  // Times
  entry_time: string; // "HH:mm"
  entry_date: string; // ISO timestamp
  exit_time?: string;
  exit_date?: string;
  
  // Metadata
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface WatchlistItem {
  symbol: string;
  price: number;
  change: string;
  isVisible: boolean;
}

export interface StockEODData {
  id: number;
  symbol: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  change: number;
  change_percent: number;
  vwap: number;
  created_at: string;
}

export interface StockDataResponse {
  symbol: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  change: number;
  changePercent: number;
  vwap: number;
}
