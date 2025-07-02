import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAuthenticatedSupabaseClient } from "@/lib/data/supabase-server";
import { format } from "date-fns";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth.protect();
    const body = await request.json();

    // Validate required fields
    const {
      symbol,
      type,
      entry_price,
      quantity = 1,
      fvg_high,
      fvg_low,
      recent_limit,
      buy_side_liquidity,
      sell_side_liquidity,
      notes,
    } = body;

    if (!symbol || !type || !entry_price || !fvg_high || !fvg_low || !recent_limit) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create authenticated Supabase client
    const authSupabase = await createAuthenticatedSupabaseClient();

    // Get current date and time
    const now = new Date();
    const entry_time = format(now, "HH:mm");
    const entry_date = now.toISOString();

    // Insert new trade
    const { data: trade, error } = await authSupabase
      .from("trades")
      .insert({
        user_id: userId,
        symbol,
        type,
        status: "pending",
        entry_price: parseFloat(entry_price),
        quantity: parseFloat(quantity),
        fvg_high: parseFloat(fvg_high),
        fvg_low: parseFloat(fvg_low),
        recent_limit: parseFloat(recent_limit),
        buy_side_liquidity: buy_side_liquidity ? parseFloat(buy_side_liquidity) : null,
        sell_side_liquidity: sell_side_liquidity ? parseFloat(sell_side_liquidity) : null,
        entry_time,
        entry_date,
        notes,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating trade:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    return NextResponse.json(trade, { status: 201 });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}