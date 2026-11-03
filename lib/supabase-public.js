import { createClient } from "@supabase/supabase-js";

// Connexion pour les visiteurs : sans compte, sans accès aux données privées
export function getSupabasePublic() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false },
  });
}
