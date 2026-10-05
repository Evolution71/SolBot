import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// This client uses only the public anon key. Combined with RLS (no anon
// policies on sensitive tables — see supabase/migrations/0001_init.sql),
// it cannot read wallets, private keys, or other users' data. All
// user-specific reads go through the backend API instead (see api.js).
export const supabase = url && anonKey ? createClient(url, anonKey) : null;
