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
import { mockWatchlistItems } from "@/lib/data/mock-data";
import { WatchlistItem } from "@/lib/types";
import { useQuery } from "react-query";

type WatchlistCardProps = {
  isSignedIn: boolean;
};

const fetchWatchList = async (): Promise<WatchlistItem[]> => {
  // const response = await fetch("/api/watchlist");
  //
  // if (!response.ok) {
  //   throw new Error("Failed to fetch trades");
  // }
  //
  // return response.json();
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return mockWatchlistItems;
};

export default function WatchlistCard({ isSignedIn }: WatchlistCardProps) {
  if (!isSignedIn) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Watchlist</CardTitle>
            <CardDescription>Your tracked symbols</CardDescription>
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
        <CardContent className="relative">
          {/* Blurred skeleton background */}
          <div className="grid grid-cols-3 gap-4 filter blur-sm opacity-70">
            {/* {Array(9) */}
            {/*   .fill(0) */}
            {/*   .map((_, index) => ( */}
            {/*     <div */}
            {/*       key={index} */}
            {/*       className="p-3 border border-stone-200 dark:border-stone-800 rounded-lg" */}
            {/*     > */}
            {/*       <Skeleton className="h-5.5 w-16 rounded-md" /> */}
            {/*       <Skeleton className="h-4 w-20 mt-1 rounded-md" /> */}
            {/*       <Skeleton className="h-3.5 w-10 mt-1 rounded-md" /> */}
            {/*     </div> */}
            {/*   ))} */}
            {mockWatchlistItems.slice(0, 9).map((item) => (
              <div
                key={item.id}
                className="p-3 border border-stone-200 dark:border-stone-800 rounded-lg hover:border-stone-300 dark:hover:border-stone-700 transition-colors cursor-pointer"
              >
                <div className="font-medium">{item.symbol}</div>
                <div className="text-sm">${item.price}</div>
                <div
                  className={`text-xs ${item.change.startsWith("+") ? "text-green-600" : "text-red-600"}`}
                >
                  {item.change}
                </div>
              </div>
            ))}
          </div>

          {/* Sign in message overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-stone-500 dark:text-stone-400 mb-2">
              Sign in to view and manage your watchlist
            </p>
            <p className="text-stone-400 dark:text-stone-500 text-sm">
              Track stock symbols and monitor price changes
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const {
    isFetching,
    isError,
    data: watchlist,
    refetch,
  } = useQuery(["watchlist"], fetchWatchList, {
    // Only fetch if user is signed in
    enabled: isSignedIn,
    // Cache data for 5 minutes
    staleTime: 5 * 60 * 1000,
    // Retry 3 times if request fails
    retry: 3,
  });

  if (isFetching) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Watchlist</CardTitle>
            <CardDescription>Your tracked symbols</CardDescription>
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
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {Array(9)
              .fill(0)
              .map((_, index) => (
                <div
                  key={index}
                  className="p-3 border border-stone-200 dark:border-stone-800 rounded-lg"
                >
                  <Skeleton className="h-5.5 w-16 rounded-md" />
                  <Skeleton className="h-4 w-20 mt-1 rounded-md" />
                  <Skeleton className="h-3.5 w-10 mt-1 rounded-md" />
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !watchlist) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Watchlist</CardTitle>
            <CardDescription>Your tracked symbols</CardDescription>
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
        <CardContent className="relative">
          {/* Blurred skeleton background */}
          <div className="grid grid-cols-3 gap-4 filter blur-sm opacity-70">
            {/* {Array(9) */}
            {/*   .fill(0) */}
            {/*   .map((_, index) => ( */}
            {/*     <div */}
            {/*       key={index} */}
            {/*       className="p-3 border border-stone-200 dark:border-stone-800 rounded-lg" */}
            {/*     > */}
            {/*       <Skeleton className="h-5.5 w-16 rounded-md" /> */}
            {/*       <Skeleton className="h-4 w-20 mt-1 rounded-md" /> */}
            {/*       <Skeleton className="h-3.5 w-10 mt-1 rounded-md" /> */}
            {/*     </div> */}
            {/*   ))} */}
            {mockWatchlistItems.slice(0, 9).map((item) => (
              <div
                key={item.id}
                className="p-3 border border-stone-200 dark:border-stone-800 rounded-lg hover:border-stone-300 dark:hover:border-stone-700 transition-colors cursor-pointer"
              >
                <div className="font-medium">{item.symbol}</div>
                <div className="text-sm">${item.price}</div>
                <div
                  className={`text-xs ${item.change.startsWith("+") ? "text-green-600" : "text-red-600"}`}
                >
                  {item.change}
                </div>
              </div>
            ))}
          </div>

          {/* Sign in message overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-stone-500 dark:text-stone-400 mb-2">
              There was an error fetching your watchlist
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Watchlist</CardTitle>
          <CardDescription>Your tracked symbols</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            View All
          </Button>
          <Button size="sm">New +</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {watchlist.slice(0, 9).map((item) => (
            <div
              key={item.id}
              className="p-3 border border-stone-200 dark:border-stone-800 rounded-lg hover:border-stone-300 dark:hover:border-stone-700 transition-colors cursor-pointer"
            >
              <div className="font-medium">{item.symbol}</div>
              <div className="text-sm">${item.price}</div>
              <div
                className={`text-xs ${item.change.startsWith("+") ? "text-green-600" : "text-red-600"}`}
              >
                {item.change}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
