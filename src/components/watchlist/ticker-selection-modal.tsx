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
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Watchlist</DialogTitle>
          <DialogDescription>
            Select the tickers you want to display in your watchlist
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 py-4">
          {tickers.map((item) => (
            <div
              key={item.id}
              className={`p-3 border rounded-lg transition-all cursor-pointer ${
                visibilityState[item.id]
                  ? "border-stone-300 dark:border-stone-700"
                  : "border-stone-200 dark:border-stone-800 opacity-60"
              }`}
              onClick={() => onToggleTicker(item.id.toString())}
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

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleApply}>Apply</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
