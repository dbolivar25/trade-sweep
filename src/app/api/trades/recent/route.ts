import { NextResponse } from "next/server";
import { Trade } from "@/lib/types";
import { auth } from "@clerk/nextjs/server";
import { createAuthenticatedSupabaseClient } from "@/lib/data/supabase-server";

export async function GET() {
  try {
    const { userId } = await auth.protect();

    // Create authenticated Supabase client
    const authSupabase = await createAuthenticatedSupabaseClient();

    // Fetch recent trades for the user
    const { data: trades, error } = await authSupabase
      .from("trades")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Error fetching trades:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    // Format trades to match the UI expectations
    const formattedTrades: Trade[] = trades.map((trade) => ({
      ...trade,
      type: trade.type as 'long' | 'short',
      status: trade.status as 'pending' | 'completed',
    }));

    return NextResponse.json(formattedTrades);
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}