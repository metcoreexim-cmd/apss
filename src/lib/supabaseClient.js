import { createClient } from "@supabase/supabase-js";

// TEMP TEST – hardcoded values
const SUPABASE_URL = "https://efzqbzfgtkwglwcvjmmx.supabase.co";

// IMPORTANT:
// Supabase → Settings → API → anon public
// It MUST start with eyJhbGciOi...
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.REPLACE_WITH_FULL_ANON_PUBLIC_KEY";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
