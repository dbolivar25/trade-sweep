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
  FormMessage,
} from "@/components/ui/form";
import { useState, useEffect } from "react";
import { useMutation, useQuery } from "react-query";
import { WatchlistItem } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [symbolError, setSymbolError] = useState<string | null>(null);
  const [validSymbols, setValidSymbols] = useState<Set<string>>(new Set());

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

  const { data: watchlistData } = useQuery<WatchlistItem[]>(
    "watchlistSymbols",
    async () => {
      const response = await fetch("/api/watchlist");
      if (!response.ok) throw new Error("Failed to fetch symbols");
      return response.json();
    },
    { staleTime: 5 * 60 * 1000 }
  );

  useEffect(() => {
    if (watchlistData) {
      const symbols = new Set(watchlistData.map((item) => item.symbol));
      setValidSymbols(symbols);
    }
  }, [watchlistData]);

  const handleSymbolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setSymbol(value);

    if (value && validSymbols.size > 0 && !validSymbols.has(value)) {
      setSymbolError(`Symbol "${value}" is not in your watchlist`);
    } else {
      setSymbolError(null);
    }
  };

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
        toast.success("Trade created successfully!");
        onComplete();
      },
      onError: () => {
        toast.error("Failed to create trade");
      },
    }
  );

  async function onSubmit(data: TradeValidationFormSchema) {
    const trimmedSymbol = symbol.trim().toUpperCase();

    if (!trimmedSymbol) {
      toast.error("Please enter a symbol");
      return;
    }

    if (validSymbols.size > 0 && !validSymbols.has(trimmedSymbol)) {
      toast.error(`Symbol "${trimmedSymbol}" is not in your watchlist`);
      return;
    }

    const result = validateTrade(tradeType, data, currentTime);

    if (result.isValid) {
      toast.success("Trade validated successfully");
      createTradeMutation.mutate({
        symbol: trimmedSymbol,
        type: tradeType,
        entry_price: data.currentPrice,
        fvg_high: data.fvgHigh,
        fvg_low: data.fvgLow,
        recent_limit: data.recentLimit,
        buy_side_liquidity: data.buySideLiquidity || null,
        sell_side_liquidity: data.sellSideLiquidity || null,
      });
    } else {
      toast.error(result.message);
    }
  }

  const isLong = tradeType === "long";

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
            onChange={handleSymbolChange}
            placeholder="AAPL"
            className={cn(
              "uppercase h-11 font-mono",
              symbolError && "border-destructive focus:ring-destructive"
            )}
            required
            maxLength={10}
          />
          {symbolError && (
            <p className="text-sm text-destructive">{symbolError}</p>
          )}
        </div>

        <FormField
          control={form.control}
          name={isLong ? "buySideLiquidity" : "sellSideLiquidity"}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {isLong ? "Buy Side Liquidity" : "Sell Side Liquidity"}
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="h-11 font-mono"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="fvgHigh"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{isLong ? "Bearish" : "Bullish"} FVG High</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="h-11 font-mono"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fvgLow"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{isLong ? "Bearish" : "Bullish"} FVG Low</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="h-11 font-mono"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="recentLimit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{isLong ? "Recent High" : "Recent Low"}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="h-11 font-mono"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="currentPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Entry Price</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="h-11 font-mono"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className={cn(
            "w-full h-12 font-medium",
            isLong
              ? "bg-gain hover:bg-gain/90 text-white"
              : "bg-loss hover:bg-loss/90 text-white"
          )}
          disabled={createTradeMutation.isLoading || !!symbolError}
        >
          {createTradeMutation.isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating Trade...
            </>
          ) : (
            `Validate ${isLong ? "Long" : "Short"} Entry`
          )}
        </Button>
      </form>
    </Form>
  );
}
