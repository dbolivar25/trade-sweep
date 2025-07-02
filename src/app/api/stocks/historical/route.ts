import { NextResponse } from "next/server";
import { supabase } from "@/lib/data/supabase";
import { subDays } from "date-fns";

export interface HistoricalStockData {
  symbol: string;
  data: {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    change: number;
    changePercent: number;
  }[];
  latestPrice: number;
  latestChange: number;
  latestChangePercent: number;
}

export async function GET() {
  try {
    // Calculate date range for last 90 days
    const endDate = new Date();
    const startDate = subDays(endDate, 90);
    
    // Format dates for SQL query
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Fetch data in batches to handle the row limit
    // We'll use the range feature to paginate through results
    type StockDataRow = {
      symbol: string;
      date: string;
      open: number;
      high: number;
      low: number;
      close: number;
      volume: number;
      change: number;
      change_percent: number;
    };
    const allHistoricalData: StockDataRow[] = [];
    const limit = 1000;
    let offset = 0;
    let hasMore = true;
    
    while (hasMore) {
      const { data: batchData, error: batchError } = await supabase
        .from("stock_eod_data")
        .select("symbol, date, open, high, low, close, volume, change, change_percent")
        .gte("date", startDateStr)
        .lte("date", endDateStr)
        .order("symbol", { ascending: true })
        .order("date", { ascending: true })
        .range(offset, offset + limit - 1);
        
      if (batchError) {
        console.error("Error fetching batch data:", batchError);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
      }
      
      if (batchData && batchData.length > 0) {
        allHistoricalData.push(...batchData);
        offset += limit;
        hasMore = batchData.length === limit;
      } else {
        hasMore = false;
      }
    }
    
    const historicalData = allHistoricalData;


    // Group historical data by symbol
    type HistoricalDataItem = NonNullable<typeof historicalData>[0];
    const groupedData = new Map<string, HistoricalDataItem[]>();
    historicalData?.forEach(item => {
      if (!groupedData.has(item.symbol)) {
        groupedData.set(item.symbol, []);
      }
      groupedData.get(item.symbol)?.push(item);
    });

    // Format response
    const response: HistoricalStockData[] = Array.from(groupedData.entries())
      .map(([symbol, data]) => {
        // Get the latest and earliest data 
        const latestData = data[data.length - 1];
        const earliestData = data[0];
        
        // Calculate 90-day change
        let change90Day = 0;
        let changePercent90Day = 0;
        
        if (latestData && earliestData) {
          change90Day = latestData.close - earliestData.close;
          changePercent90Day = ((latestData.close - earliestData.close) / earliestData.close) * 100;
        }
        
        // Transform data to match our interface (snake_case to camelCase)
        const transformedData = data.map(item => ({
          date: item.date,
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
          volume: item.volume,
          change: item.change,
          changePercent: item.change_percent
        }));
        
        return {
          symbol,
          data: transformedData,
          latestPrice: latestData ? latestData.close : 0,
          latestChange: change90Day,
          latestChangePercent: changePercent90Day
        };
      })
      .sort((a, b) => a.symbol.localeCompare(b.symbol)); // Sort alphabetically

    // Simple approach: cache for 1 hour during market hours
    // This ensures fresh data after midnight without complex timezone logic
    const now = new Date();
    const hour = now.getUTCHours();
    
    // Between 5 AM and 9 PM UTC (roughly covering US market hours)
    // Cache for 1 hour, otherwise cache for 30 minutes
    const cacheSeconds = (hour >= 5 && hour <= 21) ? 3600 : 1800;
    
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': `public, s-maxage=${cacheSeconds}, stale-while-revalidate=300`,
        // 1 hour cache during day, 30 min at night when data updates
      },
    });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}