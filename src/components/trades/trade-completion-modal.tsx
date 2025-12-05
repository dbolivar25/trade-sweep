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
import { useQuery, useMutation } from "@tanstack/react-query";
import { Trade } from "@/lib/types";
import {
  validateTradePrice,
  calculateSafeProfit,
  TRADE_LIMITS,
} from "@/lib/constants/trade-limits";
import { toast } from "sonner";
import { TrendingUp, TrendingDown, Loader2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

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

  const { data: trade } = useQuery<Trade>({
    queryKey: ["trade", tradeId],
    queryFn: async () => {
      const response = await fetch(`/api/trades/${tradeId}`);
      if (!response.ok) throw new Error("Failed to fetch trade");
      return response.json();
    },
    enabled: isOpen && !!tradeId,
  });

  const completeTradeMutation = useMutation({
    mutationFn: async (exit_price: number) => {
      const response = await fetch(`/api/trades/${tradeId}/complete`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exit_price }),
      });
      if (!response.ok) throw new Error("Failed to complete trade");
      return response.json();
    },
    onSuccess: () => {
      toast.success("Trade completed successfully!");
      onComplete();
      setExitPrice("");
      setCalculatedPnL(null);
    },
    onError: () => {
      toast.error("Failed to complete trade");
    },
  });

  useEffect(() => {
    if (trade && exitPrice) {
      const exit = parseFloat(exitPrice);
      if (!isNaN(exit)) {
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
      toast.error("Please enter a valid price");
      return;
    }

    const validation = validateTradePrice(exit);
    if (!validation.isValid) {
      toast.error(validation.error || "Invalid price");
      return;
    }

    completeTradeMutation.mutate(exit);
  };

  if (!trade) return null;

  const isLong = trade.type === "long";
  const isProfitable = calculatedPnL !== null && calculatedPnL >= 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-2xl">Complete Trade</DialogTitle>
          <DialogDescription>
            Enter the exit price to close your position
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="px-6 space-y-6">
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center",
                    isLong ? "bg-gain/10" : "bg-loss/10"
                  )}
                >
                  {isLong ? (
                    <TrendingUp className="h-5 w-5 text-gain" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-loss" />
                  )}
                </div>
                <div>
                  <p className="font-semibold">{trade.symbol}</p>
                  <p
                    className={cn(
                      "text-sm font-medium capitalize",
                      isLong ? "text-gain" : "text-loss"
                    )}
                  >
                    {trade.type}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Entry</p>
                <p className="font-mono font-semibold">
                  ${trade.entry_price.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="exit_price" className="text-sm font-medium">
                Exit Price
              </Label>
              <Input
                id="exit_price"
                type="number"
                step="0.01"
                value={exitPrice}
                onChange={(e) => setExitPrice(e.target.value)}
                className={cn(
                  "h-12 font-mono text-lg",
                  priceError && "border-destructive focus:ring-destructive"
                )}
                placeholder="0.00"
                max={TRADE_LIMITS.MAX_PRICE}
                min={TRADE_LIMITS.MIN_PRICE}
                required
                autoFocus
              />
              {priceError && (
                <p className="text-sm text-destructive">{priceError}</p>
              )}
            </div>

            {calculatedPnL !== null && (
              <div
                className={cn(
                  "p-4 rounded-xl border-2 transition-colors",
                  isProfitable
                    ? "bg-gain/5 border-gain/20"
                    : "bg-loss/5 border-loss/20"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="font-mono">
                      ${trade.entry_price.toFixed(2)}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                    <span className="font-mono">${exitPrice}</span>
                  </div>
                  <div
                    className={cn(
                      "text-2xl font-semibold font-mono",
                      isProfitable ? "text-gain" : "text-loss"
                    )}
                  >
                    {isProfitable ? "+" : ""}${calculatedPnL.toFixed(2)}
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="p-6 pt-4 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                !exitPrice || !!priceError || completeTradeMutation.isPending
              }
              className={cn(
                "flex-1",
                isProfitable
                  ? "bg-gain hover:bg-gain/90"
                  : "bg-accent hover:bg-accent/90",
                "text-white"
              )}
            >
              {completeTradeMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Completing...
                </>
              ) : (
                "Complete Trade"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
