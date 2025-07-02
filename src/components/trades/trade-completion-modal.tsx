"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation } from "react-query";
import { Trade } from "@/lib/types";
import { validateTradePrice, calculateSafeProfit, TRADE_LIMITS } from "@/lib/constants/trade-limits";
import { toast } from "sonner";

interface TradeCompletionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tradeId: string;
  onComplete: () => void;
}

export default function TradeCompletionModal({
  isOpen,
  onOpenChange,
  tradeId,
  onComplete,
}: TradeCompletionModalProps) {
  const [exitPrice, setExitPrice] = useState("");
  const [calculatedPnL, setCalculatedPnL] = useState<number | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);

  // Fetch trade details
  const { data: trade } = useQuery<Trade>(
    ["trade", tradeId],
    async () => {
      const response = await fetch(`/api/trades/${tradeId}`);
      if (!response.ok) throw new Error("Failed to fetch trade");
      return response.json();
    },
    {
      enabled: isOpen && !!tradeId,
    }
  );

  // Complete trade mutation
  const completeTradeMutation = useMutation(
    async (exit_price: number) => {
      const response = await fetch(`/api/trades/${tradeId}/complete`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exit_price }),
      });
      if (!response.ok) throw new Error("Failed to complete trade");
      return response.json();
    },
    {
      onSuccess: () => {
        onComplete();
        setExitPrice("");
        setCalculatedPnL(null);
      },
    }
  );

  // Calculate P&L in real-time as user types
  useEffect(() => {
    if (trade && exitPrice) {
      const exit = parseFloat(exitPrice);
      if (!isNaN(exit)) {
        // Validate the exit price
        const validation = validateTradePrice(exit);
        if (!validation.isValid) {
          setPriceError(validation.error || "Invalid price");
          setCalculatedPnL(null);
          return;
        }
        
        setPriceError(null);
        const pnl = calculateSafeProfit(
          trade.type,
          trade.entry_price,
          exit,
          trade.quantity || 1
        );
        
        setCalculatedPnL(pnl);
      } else {
        setCalculatedPnL(null);
        setPriceError(null);
      }
    } else {
      setCalculatedPnL(null);
      setPriceError(null);
    }
  }, [exitPrice, trade]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const exit = parseFloat(exitPrice);
    
    if (isNaN(exit)) {
      toast("Please enter a valid price", {
        duration: 3000,
        position: "top-center",
      });
      return;
    }
    
    const validation = validateTradePrice(exit);
    if (!validation.isValid) {
      toast(validation.error || "Invalid price", {
        duration: 3000,
        position: "top-center",
      });
      return;
    }
    
    completeTradeMutation.mutate(exit);
  };

  if (!trade) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Complete Trade</DialogTitle>
          <DialogDescription>
            Enter the exit price to complete this {trade.type} trade for {trade.symbol}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Type</Label>
              <div className="col-span-3 capitalize">
                <span className={trade.type === "long" ? "text-green-600" : "text-red-600"}>
                  {trade.type}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Entry</Label>
              <div className="col-span-3">${trade.entry_price.toFixed(2)}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="exit_price" className="text-right">
                Exit Price
              </Label>
              <div className="col-span-3">
                <Input
                  id="exit_price"
                  type="number"
                  step="0.01"
                  value={exitPrice}
                  onChange={(e) => setExitPrice(e.target.value)}
                  className={priceError ? "border-red-500" : ""}
                  placeholder="0.00"
                  max={TRADE_LIMITS.MAX_PRICE}
                  min={TRADE_LIMITS.MIN_PRICE}
                  required
                />
                {priceError && (
                  <p className="text-sm text-red-500 mt-1">{priceError}</p>
                )}
              </div>
            </div>
            {calculatedPnL !== null && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">P&L</Label>
                <div
                  className={`col-span-3 font-medium ${
                    calculatedPnL >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {calculatedPnL >= 0 ? "+" : ""}${calculatedPnL.toFixed(2)}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!exitPrice || !!priceError || completeTradeMutation.isLoading}
            >
              {completeTradeMutation.isLoading ? "Completing..." : "Complete Trade"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}