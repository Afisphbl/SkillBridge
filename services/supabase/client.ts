import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log(supabaseUrl, supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase credentials. Set SUPABASE_URL/SUPABASE_ANON_KEY (or NEXT_PUBLIC_* variants).",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
