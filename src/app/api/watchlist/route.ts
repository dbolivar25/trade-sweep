import { NextResponse } from "next/server";
import { WatchlistItem } from "@/lib/types";
import { supabase } from "@/lib/data/supabase";
import { auth } from "@clerk/nextjs/server";
import { createAuthenticatedSupabaseClient } from "@/lib/data/supabase-server";

export async function GET() {
  try {
    const { userId } = await auth.protect();

    // Fetch all stock data (doesn't need authentication)
    const { data: stockData, error: stockError } = await supabase
      .from("latest_stock_eod_data")
      .select("id, symbol, close, change_percent")
      .order("symbol", { ascending: false });

    if (stockError) {
      console.error("Supabase error:", stockError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    // Fetch user preferences with authenticated client
    const authSupabase = await createAuthenticatedSupabaseClient();
    const { data: preferences, error: prefError } = await authSupabase
      .from("user_watchlist_preferences")
      .select("symbol, is_visible")
      .eq("user_id", userId);

    if (prefError) {
      console.error("Error fetching preferences:", prefError);
      // Continue without preferences - all items will be hidden by default
    }

    // Create a map of preferences for quick lookup by symbol
    const preferencesMap = new Map<string, boolean>();
    preferences?.forEach((pref) => {
      preferencesMap.set(pref.symbol, pref.is_visible);
    });

    // Format the data to match the WatchlistItem interface with visibility info
    const watchlistItems: WatchlistItem[] = stockData
      .map((item) => ({
        symbol: item.symbol,
        price: parseFloat(item.close.toFixed(2)),
        change: formatChangePercent(item.change_percent),
        isVisible: preferencesMap.get(item.symbol) ?? false, // Look up by symbol
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
