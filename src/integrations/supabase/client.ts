import { createClient } from "@supabase/supabase-js";

// 🔥 HARD-CODED VALUES (temporary test)
const SUPABASE_URL = "https://efzqbzfgtkwglwcvjmmx.supabase.co";

// ⚠️ IMPORTANT:
// Supabase → Settings → API → COPY **anon public**
// It MUST start with eyJhbGciOi...
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.REPLACE_WITH_FULL_KEY_HERE";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
