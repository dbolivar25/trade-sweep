"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { TrendingUp, TrendingDown, ArrowRight, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WatchlistItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import TickerSelectionModal from "@/components/watchlist/ticker-selection-modal";

type WatchlistPreviewProps = {
  isSignedIn: boolean;
  userId?: string;
};

const fetchWatchList = async (): Promise<WatchlistItem[]> => {
  const response = await fetch("/api/watchlist");
  if (!response.ok) throw new Error("Failed to fetch watchlist");
  return response.json();
};

const updatePreferences = async (preferences: Record<string, boolean>) => {
  const response = await fetch("/api/watchlist/preferences", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ preferences }),
  });
  if (!response.ok) throw new Error("Failed to update preferences");
  return response.json();
};

export function WatchlistPreview({ isSignedIn, userId }: WatchlistPreviewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempVisibility, setTempVisibility] = useState<Record<string, boolean>>(
    {}
  );
  const queryClient = useQueryClient();

  const { data: watchlist, isLoading } = useQuery({
    queryKey: ["watchlist", userId],
    queryFn: fetchWatchList,
    enabled: isSignedIn,
    staleTime: 60 * 60 * 1000,
  });

  const preferencesMutation = useMutation({
    mutationFn: updatePreferences,
    onMutate: async (newPreferences) => {
      await queryClient.cancelQueries({ queryKey: ["watchlist"] });
      const previousWatchlist = queryClient.getQueryData<WatchlistItem[]>([
        "watchlist",
        userId,
      ]);
      if (previousWatchlist) {
        queryClient.setQueryData<WatchlistItem[]>(
          ["watchlist", userId],
          previousWatchlist.map((item) => ({
            ...item,
            isVisible: newPreferences[item.symbol] ?? false,
          }))
        );
      }
      return { previousWatchlist };
    },
    onError: (_err, _newPreferences, context) => {
      if (context?.previousWatchlist) {
        queryClient.setQueryData(
          ["watchlist", userId],
          context.previousWatchlist
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
  });

  const toggleTicker = useCallback((id: string) => {
    setTempVisibility((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const applyVisibilityChanges = useCallback(() => {
    if (watchlist) {
      const allPreferences: Record<string, boolean> = {};
      watchlist.forEach((item) => {
        allPreferences[item.symbol] = tempVisibility[item.symbol] ?? false;
      });
      setIsModalOpen(false);
      preferencesMutation.mutate(allPreferences);
    }
  }, [watchlist, tempVisibility, preferencesMutation]);

  const openSelectionModal = useCallback(() => {
    if (watchlist) {
      const currentVisibility: Record<string, boolean> = {};
      watchlist.forEach((item) => {
        currentVisibility[item.symbol] = item.isVisible;
      });
      setTempVisibility(currentVisibility);
      setIsModalOpen(true);
    }
  }, [watchlist]);

  const visibleTickers = watchlist?.filter((item) => item.isVisible) || [];

  if (!isSignedIn) {
    return (
      <section className="animate-in delay-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl">Watchlist</h2>
          <Button variant="ghost" size="sm" disabled>
            <Settings2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="p-8 text-center">
            <p className="text-muted-foreground mb-2">
              Sign in to manage your watchlist
            </p>
            <p className="text-sm text-muted-foreground/70">
              Track your favorite symbols and monitor price changes
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="animate-in delay-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl">Watchlist</h2>
        </div>

        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="divide-y divide-border">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4 flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-5 w-16 shimmer rounded" />
                  <div className="h-4 w-20 shimmer rounded" />
                </div>
                <div className="h-5 w-16 shimmer rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="animate-in delay-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl">Watchlist</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={openSelectionModal}
          className="text-muted-foreground hover:text-foreground"
        >
          <Settings2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {visibleTickers.length > 0 ? (
          <>
            <div className="divide-y divide-border">
              {visibleTickers.slice(0, 5).map((item) => {
                const changeValue = parseFloat(
                  item.change.replace(/[+%]/g, "")
                );
                const isPositive = changeValue > 0;

                return (
                  <div
                    key={item.symbol}
                    className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
                  >
                    <div>
                      <p className="font-semibold">{item.symbol}</p>
                      <p className="text-sm font-mono text-muted-foreground">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "flex items-center gap-1 font-mono text-sm font-medium",
                        isPositive ? "text-gain" : "text-loss"
                      )}
                    >
                      {isPositive ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      {item.change}
                    </div>
                  </div>
                );
              })}
            </div>

            <Link
              href="/watchlist"
              className="flex items-center justify-center gap-2 p-4 border-t border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
            >
              View all stocks
              <ArrowRight className="h-4 w-4" />
            </Link>
          </>
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground mb-3">No symbols selected</p>
            <Button onClick={openSelectionModal} variant="outline" size="sm">
              <Settings2 className="h-4 w-4 mr-2" />
              Configure Watchlist
            </Button>
          </div>
        )}
      </div>

      <TickerSelectionModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        tickers={watchlist || []}
        visibilityState={tempVisibility}
        onToggleTicker={toggleTicker}
        onApply={applyVisibilityChanges}
      />
    </section>
  );
}
