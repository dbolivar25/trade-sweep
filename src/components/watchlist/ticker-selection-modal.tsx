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

// Simple type for tracking ticker visibility state
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
  // Handler for when the user applies their changes
  function handleApply() {
    onApply();
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] flex flex-col max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Edit Watchlist</DialogTitle>
          <DialogDescription>
            Select the tickers you want to display in your watchlist
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {tickers.map((item) => (
              <div
                key={item.symbol}
                className={`p-3 border rounded-lg transition-all cursor-pointer ${
                  visibilityState[item.symbol]
                    ? "border-stone-300 dark:border-stone-700"
                    : "border-stone-200 dark:border-stone-800 opacity-60 dark:opacity-80"
                }`}
                onClick={() => onToggleTicker(item.symbol)}
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
            ))}
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleApply}>Apply</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
