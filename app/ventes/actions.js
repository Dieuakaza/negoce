"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabase } from "../../lib/supabase";

export async function enregistrerVente(formData) {
  const produitId = String(formData.get("produit_id") || "");
  const quantite = Math.round(Number(formData.get("quantite")) || 0);

  if (!produitId || quantite < 1) {
    redirect("/ventes?erreur=" + encodeURIComponent("Choisissez un produit et une quantité."));
  }

  // La base retire le stock et enregistre la vente en une seule opération
  const { error } = await getSupabase().rpc("enregistrer_vente", {
    p_produit_id: produitId,
    p_quantite: quantite,
  });

  if (error) {
    redirect("/ventes?erreur=" + encodeURIComponent(error.message));
  }

  revalidatePath("/ventes");
  revalidatePath("/produits");
  redirect("/ventes?ok=1");
}
