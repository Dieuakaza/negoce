"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabase } from "../../lib/supabase";

// « S, M, L » devient ["S", "M", "L"]
function liste(valeur) {
  const resultat = [];
  for (const brut of String(valeur || "").split(/[,;\n]/)) {
    const element = brut.trim().slice(0, 30);
    if (element && !resultat.some((x) => x.toLowerCase() === element.toLowerCase())) {
      resultat.push(element);
    }
  }
  return resultat.slice(0, 20);
}

function lireFormulaire(formData) {
  const entier = (nom) => Math.max(0, Math.round(Number(formData.get(nom)) || 0));
  const promoBrute = String(formData.get("prix_promo") || "").trim();
  return {
    nom: String(formData.get("nom") || "").trim(),
    description: String(formData.get("description") || "").trim() || null,
    prix_achat: entier("prix_achat"),
    prix_vente: entier("prix_vente"),
    prix_promo: promoBrute === "" ? null : Math.max(0, Math.round(Number(promoBrute) || 0)),
    stock: entier("stock"),
    tailles: liste(formData.get("tailles")),
    couleurs: liste(formData.get("couleurs")),
    actif: formData.get("actif") === "on",
  };
}

function verifier(produit) {
  if (!produit.nom) return "Le nom du produit est obligatoire.";
  if (produit.prix_promo !== null && produit.prix_promo >= produit.prix_vente) {
    return "Le prix promotionnel doit être inférieur au prix de vente.";
  }
  return null;
}

function retour(cle, valeur) {
  redirect("/produits?" + cle + "=" + encodeURIComponent(valeur));
}

export async function ajouterProduit(formData) {
  const produit = lireFormulaire(formData);
  const probleme = verifier(produit);
  if (probleme) retour("erreur", probleme);

  const { error } = await getSupabase().from("produits").insert(produit);
  if (error) retour("erreur", "Enregistrement impossible : " + error.message);

  revalidatePath("/produits");
  retour("ok", "ajoute");
}

export async function modifierProduit(formData) {
  const id = String(formData.get("id") || "");
  const produit = lireFormulaire(formData);
  const probleme = verifier(produit);
  if (!id) return;
  if (probleme) retour("erreur", probleme);

  const { error } = await getSupabase().from("produits").update(produit).eq("id", id);
  if (error) retour("erreur", "Enregistrement impossible : " + error.message);

  revalidatePath("/produits");
  retour("ok", "modifie");
}

export async function supprimerProduit(formData) {
  const id = String(formData.get("id") || "");
  if (!id) return;

  const { error } = await getSupabase().from("produits").delete().eq("id", id);
  if (error) retour("erreur", "Suppression impossible : " + error.message);

  revalidatePath("/produits");
  retour("ok", "supprime");
}
