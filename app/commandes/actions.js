"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabase } from "../../lib/supabase";

// Onglet où la commande se retrouve après le changement de statut
const ONGLET_APRES = {
  confirmee: "cours",
  preparation: "cours",
  livraison: "cours",
  livree: "livrees",
  annulee: "annulees",
};

export async function changerStatut(formData) {
  const id = String(formData.get("id") || "");
  const statut = String(formData.get("statut") || "");
  const vue = String(formData.get("vue") || "traiter");
  if (!id || !statut) return;

  const { error } = await getSupabase().rpc("changer_statut_commande", {
    p_commande: id,
    p_statut: statut,
  });

  if (error) {
    redirect("/commandes?vue=" + encodeURIComponent(vue) + "&erreur=" + encodeURIComponent(error.message));
  }

  revalidatePath("/commandes");
  revalidatePath("/produits");
  revalidatePath("/ventes");
  revalidatePath("/");
  redirect("/commandes?vue=" + (ONGLET_APRES[statut] || vue) + "&ok=" + statut);
}
