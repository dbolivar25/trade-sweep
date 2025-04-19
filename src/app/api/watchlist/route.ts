import { NextResponse } from "next/server";
import { WatchlistItem } from "@/lib/types";
import { supabase } from "@/lib/data/supabase";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const {} = await auth.protect();

    const { data, error } = await supabase
      .from("stock_eod_data")
      .select("id, symbol, close, change_percent")
      .order("created_at", { ascending: false })
      .limit(12);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    // Format the data to match the WatchlistItem interface
    const watchlistItems: WatchlistItem[] = data
      .map((item) => ({
        id: item.id,
        symbol: item.symbol,
        price: parseFloat(item.close.toFixed(2)),
        change: formatChangePercent(item.change_percent),
      }))
      .sort((a, b) => a.symbol.localeCompare(b.symbol));

    return NextResponse.json(watchlistItems);
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Helper function to format change percent
function formatChangePercent(changePercent: number): string {
  const prefix = changePercent >= 0 ? "+" : "";
  return `${prefix}${changePercent.toFixed(2)}%`;
}
