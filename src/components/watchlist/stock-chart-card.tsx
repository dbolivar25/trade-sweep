"use client";

import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { format } from "date-fns";

interface StockChartCardProps {
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
}

const chartConfig = {
  close: {
    label: "Close Price",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export default function StockChartCard({
  symbol,
  data,
  latestPrice,
  latestChange,
  latestChangePercent,
}: StockChartCardProps) {
  // Process data for chart
  const chartData = useMemo(() => {
    return data.map(item => ({
      ...item,
      // For candlestick rendering
      candleValue: item.close - item.open,
      candleBase: Math.min(item.open, item.close),
    }));
  }, [data]);

  // Calculate min and max for Y axis with padding
  const { minY, maxY } = useMemo(() => {
    const allPrices = data.flatMap(d => [d.low, d.high]);
    const min = Math.min(...allPrices);
    const max = Math.max(...allPrices);
    const padding = (max - min) * 0.1;
    return { minY: min - padding, maxY: max + padding };
  }, [data]);

  const isPositive = latestChange >= 0;

  // For now, let's use a simple area chart
  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200 cursor-pointer group">
      <CardHeader className="pb-2">
        <div className="flex flex-col space-y-1">
          <h3 className="text-xl font-bold">{symbol}</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold">${latestPrice.toFixed(2)}</span>
            <span className={`text-sm font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
              {isPositive ? "+" : ""}{latestChange.toFixed(2)} ({isPositive ? "+" : ""}{latestChangePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow pt-0 px-3">
        <ChartContainer config={chartConfig} className="h-[180px] w-full">
          <AreaChart 
            data={chartData} 
            margin={{ top: 10, right: 10, bottom: 20, left: 0 }}
          >
            <defs>
              <linearGradient id={`gradient-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/30" />
            <XAxis 
              dataKey="date"
              tickFormatter={(value) => format(new Date(value), "MMM d")}
              tick={({ x, y, payload, index }) => {
                if (index === 0) return <g />; // Skip first label
                return (
                  <text x={x} y={y} dy={16} textAnchor="middle" fontSize={10} className="fill-muted-foreground">
                    {format(new Date(payload.value), "MMM d")}
                  </text>
                );
              }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={40}
            />
            <YAxis 
              domain={[minY, maxY]}
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value >= 1000 ? `${(value/1000).toFixed(0)}k` : value.toFixed(0)}`}
              width={45}
            />
            <ChartTooltip 
              content={
                <ChartTooltipContent 
                  labelFormatter={(value) => format(new Date(value), "MMM d, yyyy")}
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any, name: any, props: any) => {
                    const item = props.payload;
                    return (
                      <div className="text-xs space-y-1">
                        <div className="font-medium">${item.close.toFixed(2)}</div>
                        <div className="text-muted-foreground">
                          O: ${item.open.toFixed(2)} H: ${item.high.toFixed(2)}
                        </div>
                        <div className="text-muted-foreground">
                          L: ${item.low.toFixed(2)} V: {(item.volume / 1000000).toFixed(1)}M
                        </div>
                        <div className={item.change >= 0 ? "text-green-600" : "text-red-600"}>
                          {item.change >= 0 ? "+" : ""}{item.change.toFixed(2)} ({item.changePercent.toFixed(2)}%)
                        </div>
                      </div>
                    );
                  }}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="close"
              stroke={isPositive ? "#10b981" : "#ef4444"}
              strokeWidth={2}
              fill={`url(#gradient-${symbol})`}
              className="group-hover:drop-shadow-sm"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}