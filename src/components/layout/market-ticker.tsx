"use client";

import { useQuery } from "react-query";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { WatchlistItem } from "@/lib/types";

const fetchWatchList = async (): Promise<WatchlistItem[]> => {
  const response = await fetch("/api/watchlist");
  if (!response.ok) {
    throw new Error("Failed to fetch watchlist");
  }
  return response.json();
};

export function MarketTicker() {
  const { data: watchlist, isLoading } = useQuery(
    ["watchlistTicker"],
    fetchWatchList,
    {
      staleTime: 60 * 1000,
      refetchInterval: 60 * 1000,
    }
  );

  if (isLoading || !watchlist) {
    return (
      <div className="h-10 bg-secondary/50 border-b border-border flex items-center overflow-hidden">
        <div className="flex gap-8 px-4">
          {Array(8)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-3 w-12 shimmer rounded" />
                <div className="h-3 w-16 shimmer rounded" />
              </div>
            ))}
        </div>
      </div>
    );
  }

  const tickerItems = [...watchlist, ...watchlist];

  return (
    <div className="h-10 bg-secondary/30 dark:bg-secondary/50 border-b border-border flex items-center overflow-hidden relative">
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-secondary/30 dark:from-secondary/50 to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-secondary/30 dark:from-secondary/50 to-transparent z-10" />

      <div className="flex ticker-scroll whitespace-nowrap">
        {tickerItems.map((item, index) => {
          const changeValue = parseFloat(item.change.replace(/[+%]/g, ""));
          const isPositive = changeValue > 0;
          const isNeutral = changeValue === 0;

          return (
            <div
              key={`${item.symbol}-${index}`}
              className="flex items-center gap-2 px-6 border-r border-border/50 last:border-r-0"
            >
              <span className="font-medium text-sm text-foreground">
                {item.symbol}
              </span>
              <span className="font-mono text-sm text-muted-foreground">
                ${item.price.toFixed(2)}
              </span>
              <span
                className={cn(
                  "flex items-center gap-0.5 text-xs font-medium",
                  isPositive && "text-gain",
                  !isPositive && !isNeutral && "text-loss",
                  isNeutral && "text-muted-foreground"
                )}
              >
                {isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : isNeutral ? (
                  <Minus className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {item.change}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
