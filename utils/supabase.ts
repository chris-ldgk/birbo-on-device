import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getEnv } from "./env.ts";

let supabase: SupabaseClient | null = null;

const { SUPABASE_URL, SUPABASE_KEY } = getEnv();

export function getSupabaseClient() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_KEY");
  }
  if (!supabase) {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  }
  return supabase;
}
