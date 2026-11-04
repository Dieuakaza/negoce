"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabasePublic } from "../../lib/supabase-public";
import { versNumeroWhatsapp } from "../../lib/texte";

export async function commander(etatPrecedent, formData) {
  // Piège pour les robots : ce champ reste vide quand c’est une vraie personne
  if (String(formData.get("site_web") || "") !== "") {
    redirect("/");
  }

  const slug = String(formData.get("slug") || "");
  const produitId = String(formData.get("produit_id") || "");
  const quantite = Math.round(Number(formData.get("quantite")) || 0);
  const taille = String(formData.get("taille") || "").trim();
  const couleur = String(formData.get("couleur") || "").trim();
  const nom = String(formData.get("nom") || "").trim().slice(0, 80);
  const telephone = versNumeroWhatsapp(formData.get("telephone"));
  const adresse = String(formData.get("adresse") || "").trim().slice(0, 200);
  const ville = String(formData.get("ville") || "").trim().slice(0, 60);
  const note = String(formData.get("note") || "").trim().slice(0, 300);

  if (!slug || !produitId || quantite < 1) {
    return { erreur: "Commande incomplète. Recharge la page et réessaie." };
  }
  if (nom.length < 2) return { erreur: "Indique ton nom." };
  if (!/^[0-9]{8,15}$/.test(telephone)) {
    return { erreur: "Numéro de téléphone incorrect. Vérifie-le." };
  }
  if (!adresse) {
    return { erreur: "Indique ton adresse ou ton quartier pour la livraison." };
  }

  const { data, error } = await getSupabasePublic().rpc("passer_commande", {
    p_slug: slug,
    p_nom: nom,
    p_telephone: telephone,
    p_adresse: adresse,
    p_ville: ville,
    p_note: note,
    p_lignes: [
      { produit_id: produitId, quantite, taille: taille || null, couleur: couleur || null },
    ],
  });

  if (error) return { erreur: error.message };

  // On garde un petit résumé pour la page de remerciement
  const resume = {
    slug,
    numero: data.numero,
    total: data.total,
    lignes: data.lignes || [],
    nom,
    telephone,
    adresse,
    ville,
  };
  const magasin = await cookies();
  magasin.set("derniere_commande", JSON.stringify(resume), {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 6,
  });

  redirect("/b/" + slug + "/merci");
}
