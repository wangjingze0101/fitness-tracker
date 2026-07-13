import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const TABLES = {
  ACTIONS: "actions",
  WORKOUT_RECORDS: "workout_records",
  BODY_METRICS: "body_metrics",
} as const;
