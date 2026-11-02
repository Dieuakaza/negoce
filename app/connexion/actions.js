"use server";

import { redirect } from "next/navigation";
import { getSupabase } from "../../lib/supabase";

function retour(mode, cle, message) {
  redirect("/connexion?mode=" + mode + "&" + cle + "=" + encodeURIComponent(message));
}

export async function seConnecter(formData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  const { error } = await getSupabase().auth.signInWithPassword({ email, password });
  if (error) retour("connexion", "erreur", "E-mail ou mot de passe incorrect.");
  redirect("/");
}

export async function creerCompte(formData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const boutique = String(formData.get("boutique") || "").trim();

  const { data, error } = await getSupabase().auth.signUp({
    email,
    password,
    options: { data: { boutique: boutique || "Ma boutique" } },
  });

  if (error) {
    const message =
      error.code === "user_already_exists"
        ? "Cette adresse e-mail a déjà un compte. Connectez-vous."
        : error.code === "weak_password"
        ? "Mot de passe trop faible. Utilisez au moins 6 caractères."
        : "Impossible de créer le compte : " + error.message;
    retour("inscription", "erreur", message);
  }
  if (!data.session) {
    retour("connexion", "info", "Compte créé. Vérifiez votre e-mail pour le confirmer, puis connectez-vous.");
  }
  redirect("/");
}

export async function seDeconnecter() {
  await getSupabase().auth.signOut();
  redirect("/connexion");
}
