import { createClient } from "@supabase/supabase-js";

// Connexion à la base de données (utilisée seulement côté serveur)
export function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error(
      "Les variables SUPABASE_URL et SUPABASE_SECRET_KEY sont absentes dans Vercel."
    );
  }
  return createClient(url, key, { auth: { persistSession: false } });
}
