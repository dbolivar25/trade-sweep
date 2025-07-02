import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAuthenticatedSupabaseClient } from "@/lib/data/supabase-server";
import { format } from "date-fns";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth.protect();
    const { id } = await context.params;
    const body = await request.json();

    const { exit_price } = body;

    if (!exit_price) {
      return NextResponse.json(
        { error: "Exit price is required" },
        { status: 400 }
      );
    }

    // Create authenticated Supabase client
    const authSupabase = await createAuthenticatedSupabaseClient();

    // Get current date and time for exit
    const now = new Date();
    const exit_time = format(now, "HH:mm");
    const exit_date = now.toISOString();

    // Update trade to completed with exit price
    // The database trigger will automatically calculate profit
    const { data: trade, error } = await authSupabase
      .from("trades")
      .update({
        status: "completed",
        exit_price: parseFloat(exit_price),
        exit_time,
        exit_date,
      })
      .eq("id", id)
      .eq("user_id", userId) // Ensure user owns this trade
      .select()
      .single();

    if (error) {
      console.error("Error completing trade:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (!trade) {
      return NextResponse.json({ error: "Trade not found" }, { status: 404 });
    }

    return NextResponse.json(trade);
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}