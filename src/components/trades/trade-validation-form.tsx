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

interface TradeValidationFormProps {
  tradeType: TradeType;
  onComplete: () => void;
}

export default function TradeValidationForm({
  tradeType,
  onComplete,
}: TradeValidationFormProps) {
  const { currentTime } = useTimeProvider();

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

  // Handle form submission
  function onSubmit(data: TradeValidationFormSchema) {
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
      onComplete();
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

        <Button type="submit" className="w-full">
          Validate Entry
        </Button>
      </form>
    </Form>
  );
}
