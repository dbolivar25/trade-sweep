import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

/**
 * Creates a Supabase client that passes the Clerk session token for RLS authentication
 * This should only be used in server-side API routes
 */
export async function createAuthenticatedSupabaseClient() {
  const { getToken } = await auth();
  
  // Get the Clerk session token (not a custom template)
  const token = await getToken();

  if (!token) {
    throw new Error("No authentication token available");
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );

  return supabase;
}