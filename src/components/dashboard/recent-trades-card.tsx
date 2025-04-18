"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { mockRecentTrades } from "@/lib/data/mock-data";
import TradeValidationModal from "../trades/trade-validation-modal";
import { useState } from "react";
import { useQuery } from "react-query";
import { Trade } from "@/lib/types";

type RecentTradesCardProps = {
  isSignedIn: boolean;
};

const fetchTrades = async (): Promise<Trade[]> => {
  // const response = await fetch("/api/trades/recent");
  //
  // if (!response.ok) {
  //   throw new Error("Failed to fetch trades");
  // }
  //
  // return response.json();
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return mockRecentTrades;
};

export default function RecentTradesCard({
  isSignedIn,
}: RecentTradesCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    isFetching,
    isError,
    data: trades,
    refetch,
  } = useQuery(["recentTrades"], fetchTrades, {
    // Only fetch if user is signed in
    enabled: isSignedIn,
    // Cache data for 5 minutes
    staleTime: 5 * 60 * 1000,
    // Retry 3 times if request fails
    retry: 3,
  });

  const onTradeValidationSuccess = () => {
    setIsModalOpen(false);
    refetch();
  };

  if (!isSignedIn) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Recent Trades</CardTitle>
            <CardDescription>Your recent trading history</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              View All
            </Button>
            <Button size="sm" disabled>
              New +
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-grow overflow-auto relative">
          {/* Blurred skeleton background */}
          <div className="space-y-3 filter blur-sm opacity-70">
            {/* {Array(5) */}
            {/*   .fill(0) */}
            {/*   .map((_, index) => ( */}
            {/*     <div */}
            {/*       key={index} */}
            {/*       className="flex items-center justify-between py-2 border-b border-stone-100 dark:border-stone-800 last:border-0" */}
            {/*     > */}
            {/*       <div> */}
            {/*         <div className="flex items-center"> */}
            {/*           <Skeleton className="w-2 h-2 rounded-full mr-2" /> */}
            {/*           <Skeleton className="h-5 w-16 rounded-md" /> */}
            {/*         </div> */}
            {/*         <Skeleton className="h-3 w-12 mt-1 rounded-md" /> */}
            {/*       </div> */}
            {/*       <div className="text-right"> */}
            {/*         <Skeleton className="h-5 w-16 rounded-md mb-1" /> */}
            {/*         <Skeleton className="h-3 w-24 rounded-md" /> */}
            {/*       </div> */}
            {/*     </div> */}
            {/*   ))} */}
            {mockRecentTrades.slice(0, 10).map((trade) => (
              <div
                key={trade.id}
                className="flex items-center justify-between py-2 border-b border-stone-100 dark:border-stone-800 last:border-0"
              >
                <div>
                  <div className="flex items-center">
                    <div
                      className={`w-2 h-2 rounded-full mr-2 ${trade.type === "Long" ? "bg-green-500" : "bg-red-500"}`}
                    ></div>
                    <div className="font-medium">{trade.type}</div>
                  </div>
                  <div className="text-xs text-stone-500">{trade.time}</div>
                </div>
                <div className="text-right">
                  <div
                    className={`font-medium ${trade.profit.startsWith("+") ? "text-green-600" : "text-red-600"}`}
                  >
                    {trade.profit}
                  </div>
                  <div className="text-xs text-stone-500">
                    {trade.entry} → {trade.exit}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sign in message overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-stone-500 dark:text-stone-400 mb-2">
              Sign in to view your trading history
            </p>
            <p className="text-stone-400 dark:text-stone-500 text-sm">
              Track and manage your trades and performance
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isFetching) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Recent Trades</CardTitle>
            <CardDescription>Your recent trading history</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              View All
            </Button>
            <Button size="sm" disabled>
              New +
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-grow overflow-auto">
          <div className="space-y-3">
            {Array(10)
              .fill(0)
              .map((_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-stone-100 dark:border-stone-800 last:border-0"
                >
                  <div>
                    <div className="flex items-center">
                      <Skeleton className="w-2 h-2 rounded-full mr-2" />
                      <Skeleton className="h-5 w-16 rounded-md" />{" "}
                      {/* Trade type */}
                    </div>
                    <Skeleton className="h-3 w-12 mt-1 rounded-md" />{" "}
                    {/* Time */}
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-5 w-16 rounded-md mb-1" />{" "}
                    {/* Profit */}
                    <Skeleton className="h-3 w-24 rounded-md" />{" "}
                    {/* Entry/Exit */}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !trades) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Recent Trades</CardTitle>
            <CardDescription>Your recent trading history</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              View All
            </Button>
            <Button size="sm" disabled>
              New +
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-grow overflow-auto relative">
          {/* Blurred skeleton background */}
          <div className="space-y-3 filter blur-sm opacity-70">
            {/* {Array(5) */}
            {/*   .fill(0) */}
            {/*   .map((_, index) => ( */}
            {/*     <div */}
            {/*       key={index} */}
            {/*       className="flex items-center justify-between py-2 border-b border-stone-100 dark:border-stone-800 last:border-0" */}
            {/*     > */}
            {/*       <div> */}
            {/*         <div className="flex items-center"> */}
            {/*           <Skeleton className="w-2 h-2 rounded-full mr-2" /> */}
            {/*           <Skeleton className="h-5 w-16 rounded-md" /> */}
            {/*         </div> */}
            {/*         <Skeleton className="h-3 w-12 mt-1 rounded-md" /> */}
            {/*       </div> */}
            {/*       <div className="text-right"> */}
            {/*         <Skeleton className="h-5 w-16 rounded-md mb-1" /> */}
            {/*         <Skeleton className="h-3 w-24 rounded-md" /> */}
            {/*       </div> */}
            {/*     </div> */}
            {/*   ))} */}
            {mockRecentTrades.slice(0, 10).map((trade) => (
              <div
                key={trade.id}
                className="flex items-center justify-between py-2 border-b border-stone-100 dark:border-stone-800 last:border-0"
              >
                <div>
                  <div className="flex items-center">
                    <div
                      className={`w-2 h-2 rounded-full mr-2 ${trade.type === "Long" ? "bg-green-500" : "bg-red-500"}`}
                    ></div>
                    <div className="font-medium">{trade.type}</div>
                  </div>
                  <div className="text-xs text-stone-500">{trade.time}</div>
                </div>
                <div className="text-right">
                  <div
                    className={`font-medium ${trade.profit.startsWith("+") ? "text-green-600" : "text-red-600"}`}
                  >
                    {trade.profit}
                  </div>
                  <div className="text-xs text-stone-500">
                    {trade.entry} → {trade.exit}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sign in message overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-stone-500 dark:text-stone-400 mb-2">
              There was an error fetching your trades
            </p>
            <p className="text-stone-400 dark:text-stone-500 text-sm">
              Please sign in to view
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Recent Trades</CardTitle>
          <CardDescription>Your recent trading history</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            View All
          </Button>
          <Button size="sm" onClick={() => setIsModalOpen(true)}>
            New +
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-auto">
        <div className="space-y-3">
          {trades.slice(0, 10).map((trade) => (
            <div
              key={trade.id}
              className="flex items-center justify-between py-2 border-b border-stone-100 dark:border-stone-800 last:border-0"
            >
              <div>
                <div className="flex items-center">
                  <div
                    className={`w-2 h-2 rounded-full mr-2 ${trade.type === "Long" ? "bg-green-500" : "bg-red-500"}`}
                  ></div>
                  <div className="font-medium">{trade.type}</div>
                </div>
                <div className="text-xs text-stone-500">{trade.time}</div>
              </div>
              <div className="text-right">
                <div
                  className={`font-medium ${trade.profit.startsWith("+") ? "text-green-600" : "text-red-600"}`}
                >
                  {trade.profit}
                </div>
                <div className="text-xs text-stone-500">
                  {trade.entry} → {trade.exit}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <TradeValidationModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onComplete={onTradeValidationSuccess}
      />
    </Card>
  );
}
