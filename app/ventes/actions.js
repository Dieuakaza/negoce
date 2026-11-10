"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabase } from "../../lib/supabase";

function retourErreur(message) {
  redirect("/ventes?erreur=" + encodeURIComponent(message));
}

export async function enregistrerVente(formData) {
  const produitId = String(formData.get("produit_id") || "");
  const quantite = Math.round(Number(formData.get("quantite")) || 0);
  const prixBrut = String(formData.get("prix") || "").trim();
  const prix = prixBrut === "" ? null : Math.round(Number(prixBrut) || 0);

  if (!produitId || quantite < 1) retourErreur("Choisis un produit et une quantité.");
  if (prix !== null && prix < 1) retourErreur("Indique un prix de vente valide.");

  // La base retire le stock et enregistre la vente en une seule opération
  const { error } = await getSupabase().rpc("enregistrer_vente", {
    p_produit_id: produitId,
    p_quantite: quantite,
    p_prix: prix,
  });
  if (error) retourErreur(error.message);

  revalidatePath("/ventes");
  revalidatePath("/produits");
  revalidatePath("/");
  redirect("/ventes?ok=1");
}

export async function annulerVente(formData) {
  const id = String(formData.get("id") || "");
  if (!id) return;

  const { error } = await getSupabase().rpc("annuler_vente", { p_vente_id: id });
  if (error) retourErreur(error.message);

  revalidatePath("/ventes");
  revalidatePath("/produits");
  revalidatePath("/");
  redirect("/ventes?ok=annulee");
}
