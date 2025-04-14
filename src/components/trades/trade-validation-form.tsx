"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validateTrade } from "@/lib/utils/trade-validation";
import { TradeType, TradeFormData } from "@/lib/types";
import { toast } from "sonner";
import { useTimeProvider } from "@/lib/hooks/use-time-provider";

interface TradeValidationFormProps {
  tradeType: TradeType;
  onComplete: () => void;
}

export default function TradeValidationForm({
  tradeType,
  onComplete,
}: TradeValidationFormProps) {
  const initialFormData: TradeFormData = {
    buySideLiquidity: "",
    sellSideLiquidity: "",
    fvgHigh: "",
    fvgLow: "",
    recentLimit: "",
    currentPrice: "",
  };

  const { currentTime } = useTimeProvider();
  const [formData, setFormData] = useState<TradeFormData>(initialFormData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = validateTrade(tradeType, formData, currentTime);

    toast(
      `${result.isValid ? "Trade Validated" : "Validation Failed"}: ${result.message}`,
      {
        duration: 5000,
        position: "top-center",
        closeButton: true,
      },
    );

    if (result.isValid) {
      onComplete();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {tradeType === "long" ? (
        <div className="space-y-2">
          <Label htmlFor="buySideLiquidity">Buy Side Liquidity</Label>
          <Input
            id="buySideLiquidity"
            type="number"
            step="0.01"
            value={formData.buySideLiquidity}
            onChange={handleChange}
            required
          />
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="sellSideLiquidity">Sell Side Liquidity</Label>
          <Input
            id="sellSideLiquidity"
            type="number"
            step="0.01"
            value={formData.sellSideLiquidity}
            onChange={handleChange}
            required
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="fvgHigh">
          {tradeType === "long" ? "Bearish" : "Bullish"} FVG High
        </Label>
        <Input
          id="fvgHigh"
          type="number"
          step="0.01"
          value={formData.fvgHigh}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="fvgLow">
          {tradeType === "long" ? "Bearish" : "Bullish"} FVG Low
        </Label>
        <Input
          id="fvgLow"
          type="number"
          step="0.01"
          value={formData.fvgLow}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="recentLimit">
          {tradeType === "long" ? "Recent High" : "Short Recent Low"}
        </Label>
        <Input
          id="recentLimit"
          type="number"
          step="0.01"
          value={formData.recentLimit}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="currentPrice">Current Close Price</Label>
        <Input
          id="currentPrice"
          type="number"
          step="0.01"
          value={formData.currentPrice}
          onChange={handleChange}
          required
        />
      </div>

      <Button type="submit" className="w-full">
        Validate Entry
      </Button>
    </form>
  );
}
