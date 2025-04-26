"use client";

import { useState, useEffect } from "react";
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
import TickerSelectionModal from "@/components/watchlist/ticker-selection-modal";

// Simple type for tracking ticker visibility state
type TickerVisibility = {
  [id: string]: boolean;
};

type WatchlistCardProps = {
  isSignedIn: boolean;
  userId?: string; // Optional user ID for storage
};

// Function to get storage key for a specific user
function getStorageKey(userId?: string): string {
  return userId
    ? `watchlist-ticker-visibility-${userId}`
    : "watchlist-ticker-visibility-default";
}

// Function to save visibility state to localStorage
function saveVisibilityToStorage(
  visibilityState: TickerVisibility,
  userId?: string,
): void {
  if (typeof window !== "undefined") {
    try {
      const key = getStorageKey(userId);
      localStorage.setItem(key, JSON.stringify(visibilityState));
    } catch (error) {
      console.error("Failed to save ticker visibility to localStorage:", error);
    }
  }
}

// Function to load visibility state from localStorage
function loadVisibilityFromStorage(userId?: string): TickerVisibility | null {
  if (typeof window !== "undefined") {
    try {
      const key = getStorageKey(userId);
      const saved = localStorage.getItem(key);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error(
        "Failed to load ticker visibility from localStorage:",
        error,
      );
    }
  }
  return null;
}

// Function to fetch watchlist data
const fetchWatchList = async (): Promise<WatchlistItem[]> => {
  const response = await fetch("/api/watchlist");

  if (!response.ok) {
    throw new Error("Failed to fetch trades");
  }

  return response.json();
};

// Function to initialize visibility state, using stored values if available
function initializeVisibility(
  items: WatchlistItem[],
  userId?: string,
): TickerVisibility {
  // Try to load from localStorage first
  const storedVisibility = loadVisibilityFromStorage(userId);

  // Create a fresh object with all tickers visible by default
  const defaultVisibility = items.reduce((acc, item) => {
    acc[item.id] = false;
    return acc;
  }, {} as TickerVisibility);

  // If we have stored values, merge them with defaults
  // This ensures any new tickers that didn't exist in storage get default values
  if (storedVisibility) {
    return {
      ...defaultVisibility,
      ...storedVisibility,
    };
  }

  return defaultVisibility;
}

// Function to filter visible tickers
function getVisibleTickers(
  items: WatchlistItem[],
  visibilityState: TickerVisibility,
): WatchlistItem[] {
  return items.filter((item) => visibilityState[item.id]);
}

export default function WatchlistCard({
  isSignedIn,
  userId,
}: WatchlistCardProps) {
  // State for tracking the visibility of tickers
  const [tickerVisibility, setTickerVisibility] = useState<TickerVisibility>(
    {},
  );
  // State for modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Temporary state for when editing in the modal
  const [tempVisibility, setTempVisibility] = useState<TickerVisibility>({});
  // Track the last userId we loaded for
  const [lastLoadedUserId, setLastLoadedUserId] = useState<string | undefined>(
    userId,
  );
  // Flag to indicate initial load needed
  const [needsInitialization, setNeedsInitialization] = useState(true);

  const {
    isFetching,
    isError,
    data: watchlist,
  } = useQuery(["watchlist", userId], fetchWatchList, {
    enabled: isSignedIn,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  });

  // Effect for user sign-out - clears states
  useEffect(() => {
    if (!isSignedIn) {
      setTickerVisibility({});
      setTempVisibility({});
      setNeedsInitialization(true);
    }
  }, [isSignedIn]);

  // Effect for user change - sets the flag to initialize
  useEffect(() => {
    if (userId !== lastLoadedUserId) {
      setNeedsInitialization(true);
    }
  }, [userId, lastLoadedUserId]);

  // Effect for initialization - only runs when needed
  useEffect(() => {
    // Only initialize if we have data and need initialization
    if (watchlist && isSignedIn && needsInitialization) {
      const initialState = initializeVisibility(watchlist, userId);
      setTickerVisibility(initialState);
      setTempVisibility(initialState);
      setLastLoadedUserId(userId);
      setNeedsInitialization(false);
    }
  }, [watchlist, isSignedIn, needsInitialization, userId]);

  // Function to toggle a ticker's visibility in the modal
  function toggleTicker(id: string) {
    setTempVisibility((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  // Function to apply changes from modal and save to localStorage
  function applyVisibilityChanges() {
    const newVisibility = { ...tempVisibility };
    setTickerVisibility(newVisibility);
    saveVisibilityToStorage(newVisibility, userId);
  }

  // Function to open modal
  function openSelectionModal() {
    setTempVisibility({ ...tickerVisibility });
    setIsModalOpen(true);
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
          <div className="grid grid-cols-3 gap-4 filter blur-sm opacity-70">
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

  // Get visible tickers based on current visibility state
  const visibleTickers = getVisibleTickers(watchlist, tickerVisibility);

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
                  key={item.id}
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
