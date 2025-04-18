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

type WatchlistCardProps = {
  isLoaded: boolean;
  isSignedIn: boolean | null | undefined;
  user: any;
};

export default function WatchlistCard({
  isLoaded,
  isSignedIn,
}: WatchlistCardProps) {
  if (!isLoaded) {
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
          <div className="grid grid-cols-3 gap-4 filter blur-sm opacity-50">
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
      </CardContent>
    </Card>
  );
}
