"use server";

import { revalidatePath } from "next/cache";
import { getSupabase } from "../../lib/supabase";

function lireFormulaire(formData) {
  const entier = (nom) =>
    Math.max(0, Math.round(Number(formData.get(nom)) || 0));
  return {
    nom: String(formData.get("nom") || "").trim(),
    prix_achat: entier("prix_achat"),
    prix_vente: entier("prix_vente"),
    stock: entier("stock"),
  };
}

export async function ajouterProduit(formData) {
  const produit = lireFormulaire(formData);
  if (!produit.nom) return;
  const { error } = await getSupabase().from("produits").insert(produit);
  if (error) throw new Error(error.message);
  revalidatePath("/produits");
}

export async function modifierProduit(formData) {
  const id = String(formData.get("id") || "");
  const produit = lireFormulaire(formData);
  if (!id || !produit.nom) return;
  const { error } = await getSupabase()
    .from("produits")
    .update(produit)
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/produits");
}

export async function supprimerProduit(formData) {
  const id = String(formData.get("id") || "");
  if (!id) return;
  const { error } = await getSupabase().from("produits").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/produits");
}
