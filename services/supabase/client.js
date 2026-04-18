import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://sagyvfndcncjrkbfltyz.supabase.co";
const supabaseKey = "sb_publishable_MOhmh8ya95OOsWJj4q0YQw_vKz4LbGU";

export const supabase = createClient(supabaseUrl, supabaseKey);
