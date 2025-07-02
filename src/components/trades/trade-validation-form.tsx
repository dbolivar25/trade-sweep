"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { validateTrade } from "@/lib/utils/trade-validation";
import {
  TradeType,
  tradeValidationFormSchema,
  TradeValidationFormSchema,
} from "@/lib/types";
import { toast } from "sonner";
import { useTimeProvider } from "@/lib/hooks/use-time-provider";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useState } from "react";
import { useMutation } from "react-query";

interface TradeValidationFormProps {
  tradeType: TradeType;
  onComplete: () => void;
}

export default function TradeValidationForm({
  tradeType,
  onComplete,
}: TradeValidationFormProps) {
  const { currentTime } = useTimeProvider();
  const [symbol, setSymbol] = useState("");

  const form = useForm<TradeValidationFormSchema>({
    resolver: zodResolver(tradeValidationFormSchema),
    defaultValues: {
      buySideLiquidity: "",
      sellSideLiquidity: "",
      fvgHigh: "",
      fvgLow: "",
      recentLimit: "",
      currentPrice: "",
    },
  });

  // Create trade mutation
  const createTradeMutation = useMutation(
    async (tradeData: {
      symbol: string;
      type: string;
      entry_price: string;
      fvg_high: string;
      fvg_low: string;
      recent_limit: string;
      buy_side_liquidity: string | null;
      sell_side_liquidity: string | null;
    }) => {
      const response = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tradeData),
      });
      if (!response.ok) throw new Error("Failed to create trade");
      return response.json();
    },
    {
      onSuccess: () => {
        toast("Trade created successfully!", {
          duration: 5000,
          position: "top-center",
        });
        onComplete();
      },
      onError: () => {
        toast("Failed to create trade", {
          duration: 5000,
          position: "top-center",
        });
      },
    }
  );

  // Handle form submission
  async function onSubmit(data: TradeValidationFormSchema) {
    if (!symbol.trim()) {
      toast("Please enter a symbol", {
        duration: 5000,
        position: "top-center",
      });
      return;
    }

    const result = validateTrade(tradeType, data, currentTime);

    toast(
      `${result.isValid ? "Trade Validated" : "Validation Failed"}: ${result.message}`,
      {
        duration: 5000,
        position: "top-center",
        closeButton: true,
      },
    );

    if (result.isValid) {
      // Create the trade in the database
      createTradeMutation.mutate({
        symbol: symbol.toUpperCase(),
        type: tradeType,
        entry_price: data.currentPrice,
        fvg_high: data.fvgHigh,
        fvg_low: data.fvgLow,
        recent_limit: data.recentLimit,
        buy_side_liquidity: data.buySideLiquidity || null,
        sell_side_liquidity: data.sellSideLiquidity || null,
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="symbol" className="text-sm font-medium">
            Symbol
          </label>
          <Input
            id="symbol"
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="AAPL"
            className="uppercase"
            required
          />
        </div>
        {tradeType === "long" ? (
          <FormField
            control={form.control}
            name="buySideLiquidity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Buy Side Liquidity</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        ) : (
          <FormField
            control={form.control}
            name="sellSideLiquidity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sell Side Liquidity</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="fvgHigh"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {tradeType === "long" ? "Bearish" : "Bullish"} FVG High
              </FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fvgLow"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {tradeType === "long" ? "Bearish" : "Bullish"} FVG Low
              </FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="recentLimit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {tradeType === "long" ? "Recent High" : "Recent Low"}
              </FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="currentPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Close Price</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full" 
          disabled={createTradeMutation.isLoading}
        >
          {createTradeMutation.isLoading ? "Creating Trade..." : "Validate Entry"}
        </Button>
      </form>
    </Form>
  );
}
