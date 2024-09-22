import "dotenv/config";

interface Env {
  SUPABASE_URL?: string;
  SUPABASE_KEY?: string;
}

export function getEnv(): Env {
  return {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_KEY: process.env.SUPABASE_KEY,
  };
}
