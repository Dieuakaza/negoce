"use server";

import { headers } from "next/headers";
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

export async function demanderReinitialisation(formData) {
  const email = String(formData.get("email") || "").trim();
  if (!email) {
    redirect("/connexion/oubli?erreur=" + encodeURIComponent("Indique ton adresse e-mail."));
  }

  const entetes = await headers();
  const hote = entetes.get("host");

  const { error } = await getSupabase().auth.resetPasswordForEmail(email, {
    redirectTo: "https://" + hote + "/auth/confirmation",
  });

  if (error && error.code === "over_email_send_rate_limit") {
    redirect(
      "/connexion/oubli?erreur=" +
        encodeURIComponent("Trop de demandes pour le moment. Réessaie dans quelques minutes.")
    );
  }

  // Même réponse que l’adresse ait un compte ou non
  redirect("/connexion/oubli?envoye=1");
}

export async function changerMotDePasse(formData) {
  const motDePasse = String(formData.get("password") || "");
  const confirmation = String(formData.get("confirmation") || "");

  const retourMdp = (message) =>
    redirect("/connexion/nouveau?erreur=" + encodeURIComponent(message));

  if (motDePasse.length < 6) retourMdp("Le mot de passe doit contenir au moins 6 caractères.");
  if (motDePasse !== confirmation) retourMdp("Les deux mots de passe ne sont pas identiques.");

  const { error } = await getSupabase().auth.updateUser({ password: motDePasse });
  if (error) {
    retourMdp(
      error.code === "same_password"
        ? "Choisis un mot de passe différent de l’ancien."
        : error.code === "weak_password"
        ? "Mot de passe trop faible. Essaie avec plus de caractères."
        : "Impossible de changer le mot de passe : " + error.message
    );
  }

  redirect("/connexion/nouveau?ok=1");
}
