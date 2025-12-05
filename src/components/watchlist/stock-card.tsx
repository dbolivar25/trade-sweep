"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface StockCardProps {
  symbol: string;
  data: Array<{
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    change: number;
    changePercent: number;
  }>;
  latestPrice: number;
  latestChange: number;
  latestChangePercent: number;
  className?: string;
}

export function StockCard({
  symbol,
  data,
  latestPrice,
  latestChange,
  latestChangePercent,
  className,
}: StockCardProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [isChartVisible, setIsChartVisible] = useState(false);

  useEffect(() => {
    const element = chartRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsChartVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100px", threshold: 0 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const chartData = useMemo(() => {
    if (!isChartVisible) return [];
    return data.map((item) => ({
      date: item.date,
      close: item.close,
    }));
  }, [data, isChartVisible]);

  const { minY, maxY } = useMemo(() => {
    if (!isChartVisible || data.length === 0) return { minY: 0, maxY: 100 };
    const allPrices = data.map((d) => d.close);
    const min = Math.min(...allPrices);
    const max = Math.max(...allPrices);
    const padding = (max - min) * 0.1;
    return { minY: min - padding, maxY: max + padding };
  }, [data, isChartVisible]);

  const isPositive = latestChangePercent >= 0;

  const dateRange = useMemo(() => {
    if (data.length < 2) return "";
    const start = format(new Date(data[0].date), "MMM d");
    const end = format(new Date(data[data.length - 1].date), "MMM d");
    return `${start} - ${end}`;
  }, [data]);

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl md:rounded-2xl border border-border bg-card",
        "transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-accent/30",
        className
      )}
    >
      <div className="absolute top-0 left-0 right-0 h-1">
        <div
          className={cn(
            "h-full transition-all duration-300",
            isPositive ? "bg-gain" : "bg-loss",
            "w-0 group-hover:w-full"
          )}
        />
      </div>

      <div className="p-4 md:p-6 pb-3 md:pb-4">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h3 className="text-xl md:text-2xl font-semibold tracking-tight">{symbol}</h3>
            <p className="text-xs md:text-sm text-muted-foreground">{dateRange}</p>
          </div>

          <div
            className={cn(
              "flex items-center gap-1 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium",
              isPositive ? "bg-gain/10 text-gain" : "bg-loss/10 text-loss"
            )}
          >
            {isPositive ? (
              <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
            ) : (
              <TrendingDown className="h-3 w-3 md:h-4 md:w-4" />
            )}
            {isPositive ? "+" : ""}
            {latestChangePercent.toFixed(2)}%
          </div>
        </div>

        <div className="flex items-baseline gap-2 md:gap-3 mt-2">
          <span className="text-2xl md:text-4xl font-semibold font-mono tracking-tight">
            ${latestPrice.toFixed(2)}
          </span>
          <span
            className={cn(
              "text-xs md:text-sm font-mono font-medium",
              isPositive ? "text-gain" : "text-loss"
            )}
          >
            {isPositive ? "+" : ""}
            {latestChange.toFixed(2)}
          </span>
        </div>
      </div>

      <div ref={chartRef} className="h-[140px] md:h-[180px] px-2">
        {isChartVisible ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            >
              <defs>
                <linearGradient
                  id={`gradient-${symbol}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor={isPositive ? "#FF6B4A" : "#64748B"}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="100%"
                    stopColor={isPositive ? "#FF6B4A" : "#64748B"}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <YAxis domain={[minY, maxY]} hide />
              <Area
                type="monotone"
                dataKey="close"
                stroke={isPositive ? "#FF6B4A" : "#64748B"}
                strokeWidth={2}
                fill={`url(#gradient-${symbol})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full shimmer rounded-xl" />
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card to-transparent pointer-events-none" />
    </div>
  );
}
