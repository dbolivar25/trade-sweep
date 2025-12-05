"use client";

import { useQuery } from "@tanstack/react-query";
import { StockCard } from "@/components/watchlist/stock-card";
import { LineChart, TrendingUp, TrendingDown } from "lucide-react";
import { HistoricalStockData } from "@/app/api/stocks/historical/route";
import { cn } from "@/lib/utils";

const fetchHistoricalData = async (): Promise<HistoricalStockData[]> => {
  const response = await fetch("/api/stocks/historical");
  if (!response.ok) throw new Error("Failed to fetch historical data");
  return response.json();
};

export default function Watchlist() {
  const { data: stocksData, isLoading, isError } = useQuery({
    queryKey: ["historicalStockData"],
    queryFn: fetchHistoricalData,
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: 3,
  });

  const gainers =
    stocksData?.filter((s) => s.latestChangePercent > 0).length || 0;
  const losers =
    stocksData?.filter((s) => s.latestChangePercent < 0).length || 0;

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-12 animate-in">
        <div className="flex items-center gap-3 text-muted-foreground mb-4">
          <LineChart className="h-5 w-5" />
          <span className="text-sm font-medium uppercase tracking-wider">
            Market Overview
          </span>
        </div>

        <h1 className="text-5xl md:text-6xl font-medium tracking-tight mb-4">
          Watchlist
        </h1>

        <p className="text-lg text-muted-foreground max-w-xl mb-8">
          Track performance across all your monitored symbols with 90-day
          historical data.
        </p>

        {!isLoading && !isError && stocksData && (
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gain/10">
                <TrendingUp className="h-4 w-4 text-gain" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gainers</p>
                <p className="text-xl font-semibold font-mono text-gain">
                  {gainers}
                </p>
              </div>
            </div>

            <div className="w-px h-12 bg-border" />

            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-loss/10">
                <TrendingDown className="h-4 w-4 text-loss" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Losers</p>
                <p className="text-xl font-semibold font-mono text-loss">
                  {losers}
                </p>
              </div>
            </div>

            <div className="w-px h-12 bg-border" />

            <div>
              <p className="text-sm text-muted-foreground">Total Symbols</p>
              <p className="text-xl font-semibold font-mono">
                {stocksData.length}
              </p>
            </div>
          </div>
        )}
      </header>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array(9)
            .fill(0)
            .map((_, index) => (
              <div
                key={index}
                className={cn(
                  "rounded-2xl border border-border bg-card p-6 h-[340px]",
                  "animate-in",
                  `delay-${(index % 3) * 100}`
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-2">
                    <div className="h-7 w-20 shimmer rounded" />
                    <div className="h-5 w-32 shimmer rounded" />
                  </div>
                  <div className="h-6 w-16 shimmer rounded-full" />
                </div>
                <div className="h-[220px] w-full shimmer rounded-xl" />
              </div>
            ))}
        </div>
      )}

      {isError && (
        <div className="rounded-2xl border border-border bg-card p-12 text-center animate-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
            <LineChart className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="text-xl font-medium mb-2">Failed to load data</h3>
          <p className="text-muted-foreground">
            There was an error fetching stock data. Please try refreshing the
            page.
          </p>
        </div>
      )}

      {stocksData && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {stocksData.map((stock, index) => (
            <StockCard
              key={stock.symbol}
              symbol={stock.symbol}
              data={stock.data}
              latestPrice={stock.latestPrice}
              latestChange={stock.latestChange}
              latestChangePercent={stock.latestChangePercent}
              className={cn("animate-in", `delay-${(index % 6) * 100}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
