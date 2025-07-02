"use client";

import { useQuery } from "react-query";
import StockChartCard from "@/components/watchlist/stock-chart-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { HistoricalStockData } from "@/app/api/stocks/historical/route";

// Fetch historical stock data
const fetchHistoricalData = async (): Promise<HistoricalStockData[]> => {
  const response = await fetch("/api/stocks/historical");
  if (!response.ok) {
    throw new Error("Failed to fetch historical data");
  }
  return response.json();
};

export default function Watchlist() {
  const {
    data: stocksData,
    isLoading,
    isError,
  } = useQuery(["historicalStockData"], fetchHistoricalData, {
    staleTime: 60 * 60 * 1000, // 1 hour (data only updates once per day)
    cacheTime: 24 * 60 * 60 * 1000, // Keep in cache for 24 hours
    retry: 3,
  });

  if (isLoading) {
    return (
      <div className="w-full px-4 pb-6">
        <div className="max-w-screen-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Stock Watchlist</h1>
            <p className="text-muted-foreground mt-1">
              Track performance across all symbols
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array(9)
              .fill(0)
              .map((_, index) => (
                <Card key={index} className="h-[320px]">
                  <CardHeader className="pb-2">
                    <Skeleton className="h-6 w-16 mb-2" />
                    <div className="flex items-baseline gap-2">
                      <Skeleton className="h-8 w-24" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-[180px] w-full" />
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !stocksData) {
    return (
      <div className="w-full px-4 pb-6">
        <div className="max-w-screen-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Stock Watchlist</h1>
            <p className="text-muted-foreground mt-1">
              Track performance across all symbols
            </p>
          </div>
          <div className="flex items-center justify-center h-[400px]">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">
                Failed to load stock data
              </h3>
              <p className="text-muted-foreground">
                Please try refreshing the page or check back later.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 pb-6">
      <div className="max-w-screen-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Stock Watchlist</h1>
          <p className="text-muted-foreground mt-1">
            Track performance across all symbols
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {stocksData.map((stock) => (
            <StockChartCard
              key={stock.symbol}
              symbol={stock.symbol}
              data={stock.data}
              latestPrice={stock.latestPrice}
              latestChange={stock.latestChange}
              latestChangePercent={stock.latestChangePercent}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
