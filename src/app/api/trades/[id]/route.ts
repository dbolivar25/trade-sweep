import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAuthenticatedSupabaseClient } from "@/lib/data/supabase-server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth.protect();
    const { id } = await context.params;

    // Create authenticated Supabase client
    const authSupabase = await createAuthenticatedSupabaseClient();

    // Fetch single trade
    const { data: trade, error } = await authSupabase
      .from("trades")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId) // Ensure user owns this trade
      .single();

    if (error) {
      console.error("Error fetching trade:", error);
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

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth.protect();
    const { id } = await context.params;

    // Create authenticated Supabase client
    const authSupabase = await createAuthenticatedSupabaseClient();

    // Delete the trade
    const { error } = await authSupabase
      .from("trades")
      .delete()
      .eq("id", id)
      .eq("user_id", userId); // Ensure user owns this trade

    if (error) {
      console.error("Error deleting trade:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}