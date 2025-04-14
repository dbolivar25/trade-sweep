import { Trade, WatchlistItem } from "@/lib/types";

export const mockRecentTrades: Trade[] = [
  {
    id: 1,
    type: "Short",
    entry: 156.78,
    exit: 152.34,
    status: "Completed",
    time: "09:58",
    profit: "+4.44",
  },
  {
    id: 2,
    type: "Long",
    entry: 147.23,
    exit: 149.56,
    status: "Completed",
    time: "10:15",
    profit: "+2.33",
  },
  {
    id: 3,
    type: "Short",
    entry: 167.89,
    exit: 164.21,
    status: "Completed",
    time: "10:22",
    profit: "+3.68",
  },
  {
    id: 4,
    type: "Long",
    entry: 142.55,
    exit: 144.32,
    status: "Completed",
    time: "09:55",
    profit: "+1.77",
  },
  {
    id: 5,
    type: "Short",
    entry: 189.44,
    exit: 185.23,
    status: "Completed",
    time: "10:12",
    profit: "+4.21",
  },
];

export const mockWatchlistItems: WatchlistItem[] = [
  { id: 1, symbol: "AAPL", price: 178.92, change: "+1.45" },
  { id: 2, symbol: "MSFT", price: 324.67, change: "-0.89" },
  { id: 3, symbol: "AMZN", price: 142.55, change: "+2.12" },
  { id: 4, symbol: "GOOGL", price: 139.72, change: "+0.74" },
  { id: 5, symbol: "TSLA", price: 267.33, change: "-1.23" },
  { id: 6, symbol: "META", price: 356.8, change: "+1.92" },
  { id: 7, symbol: "NVDA", price: 425.51, change: "+3.27" },
  { id: 8, symbol: "AMD", price: 142.38, change: "+0.56" },
  { id: 9, symbol: "INTC", price: 37.64, change: "-0.32" },
  { id: 10, symbol: "NFLX", price: 589.74, change: "+2.84" },
];
