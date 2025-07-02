import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAuthenticatedSupabaseClient } from "@/lib/data/supabase-server";

export async function GET() {
  try {
    const { userId } = await auth.protect();
    const supabase = await createAuthenticatedSupabaseClient();

    // Fetch user's watchlist preferences
    const { data, error } = await supabase
      .from("user_watchlist_preferences")
      .select("ticker_id, is_visible")
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching preferences:", error);
      return NextResponse.json(
        { error: "Failed to fetch preferences" },
        { status: 500 }
      );
    }

    // Convert to object format for easier client-side usage
    const preferences: Record<string, boolean> = {};
    data?.forEach((pref) => {
      preferences[pref.ticker_id] = pref.is_visible;
    });

    return NextResponse.json(preferences);
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth.protect();
    const supabase = await createAuthenticatedSupabaseClient();
    
    const body = await request.json();
    const { preferences } = body as { preferences: Record<string, boolean> };

    if (!preferences || typeof preferences !== "object") {
      return NextResponse.json(
        { error: "Invalid preferences format" },
        { status: 400 }
      );
    }

    // Convert preferences object to array format for bulk upsert
    const upsertData = Object.entries(preferences).map(([ticker_id, is_visible]) => ({
      user_id: userId,
      ticker_id,
      is_visible,
    }));

    // Bulk upsert preferences
    const { error } = await supabase
      .from("user_watchlist_preferences")
      .upsert(upsertData, {
        onConflict: "user_id,ticker_id",
      });

    if (error) {
      console.error("Error upserting preferences:", error);
      return NextResponse.json(
        { error: "Failed to update preferences" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { userId } = await auth.protect();
    const supabase = await createAuthenticatedSupabaseClient();
    
    const body = await request.json();
    const { ticker_id, is_visible } = body as { ticker_id: string; is_visible: boolean };

    if (!ticker_id || typeof is_visible !== "boolean") {
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      );
    }

    // Upsert single preference
    const { error } = await supabase
      .from("user_watchlist_preferences")
      .upsert(
        {
          user_id: userId,
          ticker_id,
          is_visible,
        },
        {
          onConflict: "user_id,ticker_id",
        }
      );

    if (error) {
      console.error("Error updating preference:", error);
      return NextResponse.json(
        { error: "Failed to update preference" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}