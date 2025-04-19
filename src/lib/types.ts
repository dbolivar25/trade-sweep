import { z } from "zod";

export type TradeType = "long" | "short";

export const tradeValidationFormSchema = z.object({
  buySideLiquidity: z.string().optional(),
  sellSideLiquidity: z.string().optional(),
  fvgHigh: z.string().min(1, { message: "FVG High is required" }),
  fvgLow: z.string().min(1, { message: "FVG Low is required" }),
  recentLimit: z.string().min(1, { message: "Recent limit is required" }),
  currentPrice: z.string().min(1, { message: "Current price is required" }),
});

export type TradeValidationFormSchema = z.infer<
  typeof tradeValidationFormSchema
>;

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
