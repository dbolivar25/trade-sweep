"use client";

import { useState, useCallback } from "react";
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
import { useQuery, useMutation, useQueryClient } from "react-query";
import TickerSelectionModal from "@/components/watchlist/ticker-selection-modal";

type WatchlistCardProps = {
  isSignedIn: boolean;
  userId?: string;
};

// Function to fetch watchlist data with visibility
const fetchWatchList = async (): Promise<WatchlistItem[]> => {
  const response = await fetch("/api/watchlist");
  if (!response.ok) {
    throw new Error("Failed to fetch watchlist");
  }
  return response.json();
};

// Function to update preferences in Supabase
const updatePreferences = async (preferences: Record<string, boolean>) => {
  const response = await fetch("/api/watchlist/preferences", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ preferences }),
  });
  
  if (!response.ok) {
    throw new Error("Failed to update preferences");
  }
  
  return response.json();
};

export default function WatchlistCard({
  isSignedIn,
  userId,
}: WatchlistCardProps) {
  // State for modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Temporary state for when editing in the modal
  const [tempVisibility, setTempVisibility] = useState<Record<string, boolean>>({});
  
  const queryClient = useQueryClient();

  const {
    isFetching,
    isError,
    data: watchlist,
  } = useQuery(["watchlist", userId], fetchWatchList, {
    enabled: isSignedIn,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  });

  // Mutation for updating preferences
  const preferencesMutation = useMutation(updatePreferences, {
    onSuccess: () => {
      // Invalidate watchlist query to refetch with new preferences
      queryClient.invalidateQueries(["watchlist"]);
    },
    onError: (error) => {
      console.error("Failed to update preferences:", error);
    },
  });

  // Function to toggle a ticker's visibility in the modal
  const toggleTicker = useCallback((id: string) => {
    setTempVisibility((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  // Function to apply changes from modal
  const applyVisibilityChanges = useCallback(() => {
    if (watchlist) {
      // Create preferences object with all tickers
      const allPreferences: Record<string, boolean> = {};
      watchlist.forEach(item => {
        allPreferences[item.symbol] = tempVisibility[item.symbol] ?? false;
      });
      
      // Update preferences in Supabase
      preferencesMutation.mutate(allPreferences);
      setIsModalOpen(false);
    }
  }, [watchlist, tempVisibility, preferencesMutation]);

  // Function to open modal
  const openSelectionModal = useCallback(() => {
    if (watchlist) {
      // Initialize temp visibility with current state from watchlist
      const currentVisibility: Record<string, boolean> = {};
      watchlist.forEach(item => {
        currentVisibility[item.symbol] = item.isVisible;
      });
      setTempVisibility(currentVisibility);
      setIsModalOpen(true);
    }
  }, [watchlist]);

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
            {mockWatchlistItems.slice(0, 9).map((item) => (
              <div
                key={item.symbol}
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

  if (isFetching || preferencesMutation.isLoading) {
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
            {mockWatchlistItems.slice(0, 9).map((item) => (
              <div
                key={item.symbol}
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

          {/* Error message overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-stone-500 dark:text-stone-400 mb-2">
              There was an error fetching your watchlist
            </p>
            <p className="text-stone-400 dark:text-stone-500 text-sm">
              Please try again later
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get visible tickers from the watchlist data
  const visibleTickers = watchlist.filter(item => item.isVisible);

  return (
    <>
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
            <Button size="sm" onClick={openSelectionModal}>
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {visibleTickers.length > 0 ? (
              visibleTickers.map((item) => (
                <div
                  key={item.symbol}
                  className="p-3 border border-stone-200 dark:border-stone-800 rounded-lg hover:border-stone-300 dark:hover:border-stone-700 transition-colors cursor-pointer"
                >
                  <div className="font-medium">{item.symbol}</div>
                  <div className="text-sm">${item.price}</div>
                  <div
                    className={`text-xs ${
                      item.change.startsWith("+")
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {item.change}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-4 text-stone-500">
                No tickers selected. Click &quot;Edit&quot; to select tickers to
                display.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Ticker Selection Modal */}
      <TickerSelectionModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        tickers={watchlist}
        visibilityState={tempVisibility}
        onToggleTicker={toggleTicker}
        onApply={applyVisibilityChanges}
      />
    </>
  );
}