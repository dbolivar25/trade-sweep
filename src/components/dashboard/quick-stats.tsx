"use client";

import { useQuery } from "react-query";
import { Trade } from "@/lib/types";
import { TrendingUp, TrendingDown, Activity, Target } from "lucide-react";
import { cn } from "@/lib/utils";

type QuickStatsProps = {
  isSignedIn: boolean;
};

const fetchTrades = async (): Promise<Trade[]> => {
  const response = await fetch("/api/trades/recent");
  if (!response.ok) throw new Error("Failed to fetch trades");
  return response.json();
};

export function QuickStats({ isSignedIn }: QuickStatsProps) {
  const { data: trades, isLoading } = useQuery(["recentTrades"], fetchTrades, {
    enabled: isSignedIn,
    staleTime: 5 * 60 * 1000,
  });

  const stats = {
    totalPnL:
      trades?.reduce((sum, t) => sum + (t.profit || 0), 0).toFixed(2) || "0.00",
    winRate: trades?.length
      ? (
          (trades.filter((t) => (t.profit || 0) > 0).length / trades.length) *
          100
        ).toFixed(0)
      : "0",
    activeTrades:
      trades?.filter((t) => t.status === "pending").length.toString() || "0",
    totalTrades: trades?.length.toString() || "0",
  };

  const isPnLPositive = parseFloat(stats.totalPnL) >= 0;

  if (!isSignedIn) {
    return (
      <section className="animate-in delay-100">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-2xl border border-border bg-card p-6"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent" />
              <div className="relative space-y-2">
                <div className="h-4 w-20 shimmer rounded" />
                <div className="h-8 w-24 shimmer rounded" />
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-muted-foreground mt-4 text-sm">
          Sign in to view your trading statistics
        </p>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="animate-in delay-100">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-2xl border border-border bg-card p-6"
            >
              <div className="space-y-2">
                <div className="h-4 w-20 shimmer rounded" />
                <div className="h-8 w-24 shimmer rounded" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  const statCards = [
    {
      label: "Total P&L",
      value: `${isPnLPositive ? "+" : ""}$${stats.totalPnL}`,
      icon: isPnLPositive ? TrendingUp : TrendingDown,
      color: isPnLPositive ? "text-gain" : "text-loss",
      bgColor: isPnLPositive ? "bg-gain/10" : "bg-loss/10",
    },
    {
      label: "Win Rate",
      value: `${stats.winRate}%`,
      icon: Target,
      color:
        parseInt(stats.winRate) >= 50 ? "text-gain" : "text-muted-foreground",
      bgColor: parseInt(stats.winRate) >= 50 ? "bg-gain/10" : "bg-muted/50",
    },
    {
      label: "Active Trades",
      value: stats.activeTrades,
      icon: Activity,
      color: "text-pending",
      bgColor: "bg-pending/10",
    },
    {
      label: "Total Trades",
      value: stats.totalTrades,
      icon: TrendingUp,
      color: "text-foreground",
      bgColor: "bg-muted/50",
    },
  ];

  return (
    <section className="animate-in delay-100">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div
            key={stat.label}
            className={cn(
              "relative overflow-hidden rounded-2xl border border-border bg-card p-6",
              "transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
              `animate-in delay-${(index + 1) * 100}`
            )}
          >
            <div
              className={cn(
                "absolute top-4 right-4 p-2 rounded-xl",
                stat.bgColor
              )}
            >
              <stat.icon className={cn("h-5 w-5", stat.color)} />
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground font-medium">
                {stat.label}
              </p>
              <p className={cn("text-3xl font-semibold font-mono", stat.color)}>
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
