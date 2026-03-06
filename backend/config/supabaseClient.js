import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("⚠️  Missing SUPABASE_URL or Key in env");
  // Don't strongly exit(1) on serverless environments to allow the framework to catch the error
  if (process.env.NODE_ENV !== "production") {
    process.exit(1);
  } else {
    throw new Error("Missing Supabase credentials");
  }
}

export const supabase = createClient(supabaseUrl, supabaseKey);
