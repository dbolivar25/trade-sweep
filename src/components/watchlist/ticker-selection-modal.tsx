"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { WatchlistItem } from "@/lib/types";
import { TrendingUp, TrendingDown, Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";

type TickerVisibility = {
  [id: string]: boolean;
};

interface TickerSelectionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tickers: WatchlistItem[];
  visibilityState: TickerVisibility;
  onToggleTicker: (id: string) => void;
  onApply: () => void;
}

export default function TickerSelectionModal({
  isOpen,
  onOpenChange,
  tickers,
  visibilityState,
  onToggleTicker,
  onApply,
}: TickerSelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTickers = useMemo(() => {
    if (!searchQuery) return tickers;
    return tickers.filter((t) =>
      t.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tickers, searchQuery]);

  const selectedCount = Object.values(visibilityState).filter(Boolean).length;

  function handleApply() {
    onApply();
    onOpenChange(false);
    setSearchQuery("");
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] p-0 gap-0 flex flex-col max-h-[85vh]">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-2xl">Edit Watchlist</DialogTitle>
          <DialogDescription>
            Select which symbols to display on your dashboard
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search symbols..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pb-4">
            {filteredTickers.map((item) => {
              const isSelected = visibilityState[item.symbol];
              const changeValue = parseFloat(item.change.replace(/[+%]/g, ""));
              const isPositive = changeValue > 0;

              return (
                <button
                  key={item.symbol}
                  onClick={() => onToggleTicker(item.symbol)}
                  className={cn(
                    "relative p-4 rounded-xl border-2 text-left transition-all",
                    isSelected
                      ? "border-accent bg-accent/5"
                      : "border-border hover:border-accent/50 hover:bg-muted/30"
                  )}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-accent flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}

                  <div className="font-semibold text-lg">{item.symbol}</div>
                  <div className="font-mono text-muted-foreground">
                    ${item.price.toFixed(2)}
                  </div>
                  <div
                    className={cn(
                      "flex items-center gap-1 text-sm font-medium mt-1",
                      isPositive ? "text-gain" : "text-loss"
                    )}
                  >
                    {isPositive ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {item.change}
                  </div>
                </button>
              );
            })}
          </div>

          {filteredTickers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No symbols matching &quot;{searchQuery}&quot;
            </div>
          )}
        </div>

        <DialogFooter className="p-6 pt-4 border-t border-border">
          <div className="flex items-center justify-between w-full gap-4">
            <span className="text-sm text-muted-foreground">
              {selectedCount} symbol{selectedCount !== 1 && "s"} selected
            </span>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleApply}
                className="bg-accent hover:bg-accent/90 text-white"
              >
                Apply Changes
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
