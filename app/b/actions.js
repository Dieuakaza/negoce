"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabasePublic } from "../../lib/supabase-public";
import { urlPhoto } from "../../lib/photos";
import { versNumeroWhatsapp } from "../../lib/texte";

const MAX_LIGNES = 12;
const FORMAT_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Lit et vérifie les informations du client
function lireClient(formData) {
  const client = {
    nom: String(formData.get("nom") || "").trim().slice(0, 80),
    telephone: versNumeroWhatsapp(formData.get("telephone")),
    adresse: String(formData.get("adresse") || "").trim().slice(0, 200),
    ville: String(formData.get("ville") || "").trim().slice(0, 60),
    note: String(formData.get("note") || "").trim().slice(0, 300),
  };
  if (client.nom.length < 2) return { erreur: "Indique ton nom." };
  if (!/^[0-9]{8,15}$/.test(client.telephone)) {
    return { erreur: "Numéro de téléphone incorrect. Vérifie-le." };
  }
  if (!client.adresse) {
    return { erreur: "Indique ton adresse ou ton quartier pour la livraison." };
  }
  return { client };
}

// Garde un petit résumé pour la page de remerciement, puis y envoie le client
async function terminer(slug, data, client) {
  const resume = {
    slug,
    numero: data.numero,
    total: data.total,
    lignes: (data.lignes || []).slice(0, MAX_LIGNES).map((l) => ({
      nom: String(l.nom || "").slice(0, 40),
      taille: l.taille,
      couleur: l.couleur,
      quantite: l.quantite,
      prix: l.prix,
    })),
    nom: client.nom,
    telephone: client.telephone,
    adresse: client.adresse,
    ville: client.ville,
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

// Envoie la commande à la base (qui contrôle le stock et les options)
async function envoyerCommande(slug, client, lignes) {
  const { data, error } = await getSupabasePublic().rpc("passer_commande", {
    p_slug: slug,
    p_nom: client.nom,
    p_telephone: client.telephone,
    p_adresse: client.adresse,
    p_ville: client.ville,
    p_note: client.note,
    p_lignes: lignes,
  });
  if (error) return { erreur: error.message };
  await terminer(slug, data, client);
  return null;
}

// Commande directe d’un seul produit
export async function commander(etatPrecedent, formData) {
  // Piège pour les robots : ce champ reste vide quand c’est une vraie personne
  if (String(formData.get("site_web") || "") !== "") redirect("/");

  const slug = String(formData.get("slug") || "");
  const produitId = String(formData.get("produit_id") || "");
  const quantite = Math.round(Number(formData.get("quantite")) || 0);
  const taille = String(formData.get("taille") || "").trim();
  const couleur = String(formData.get("couleur") || "").trim();

  if (!slug || !produitId || quantite < 1) {
    return { erreur: "Commande incomplète. Recharge la page et réessaie." };
  }
  const lu = lireClient(formData);
  if (lu.erreur) return { erreur: lu.erreur };

  return await envoyerCommande(slug, lu.client, [
    { produit_id: produitId, quantite, taille: taille || null, couleur: couleur || null },
  ]);
}

// Commande de tout le panier
export async function commanderPanier(etatPrecedent, formData) {
  if (String(formData.get("site_web") || "") !== "") redirect("/");

  const slug = String(formData.get("slug") || "");
  let lignes = [];
  try {
    lignes = JSON.parse(String(formData.get("lignes") || "[]"));
  } catch {
    lignes = [];
  }
  if (!slug || !Array.isArray(lignes) || lignes.length === 0) {
    return { erreur: "Ton panier est vide." };
  }
  if (lignes.length > MAX_LIGNES) {
    return { erreur: "Ton panier contient trop d’articles différents." };
  }

  const propres = [];
  for (const l of lignes) {
    const id = String(l?.produit_id || "");
    const quantite = Math.round(Number(l?.quantite) || 0);
    if (!FORMAT_ID.test(id) || quantite < 1 || quantite > 100) {
      return { erreur: "Panier invalide. Recharge la page et réessaie." };
    }
    propres.push({
      produit_id: id,
      quantite,
      taille: String(l?.taille || "").trim().slice(0, 30) || null,
      couleur: String(l?.couleur || "").trim().slice(0, 30) || null,
    });
  }

  const lu = lireClient(formData);
  if (lu.erreur) return { erreur: lu.erreur };

  return await envoyerCommande(slug, lu.client, propres);
}

// Prix, photos et stock à jour des produits du panier
export async function rafraichirProduits(slug, ids) {
  const propres = (Array.isArray(ids) ? ids : [])
    .map((id) => String(id))
    .filter((id) => FORMAT_ID.test(id))
    .slice(0, 20);
  if (!slug || propres.length === 0) return {};

  const supabase = getSupabasePublic();
  const [produits, photos] = await Promise.all([
    supabase
      .from("produits_publics")
      .select("id, nom, prix_vente, prix_promo, disponible, tailles, couleurs")
      .eq("boutique_slug", slug)
      .in("id", propres),
    supabase
      .from("photos_publiques")
      .select("produit_id, chemin, ordre")
      .eq("boutique_slug", slug)
      .in("produit_id", propres)
      .order("ordre", { ascending: true }),
  ]);

  const premiere = {};
  for (const ph of photos.data || []) {
    if (!premiere[ph.produit_id]) premiere[ph.produit_id] = urlPhoto(ph.chemin);
  }

  const resultat = {};
  for (const p of produits.data || []) {
    const enPromo = p.prix_promo !== null && p.prix_promo !== undefined;
    resultat[p.id] = {
      nom: p.nom,
      prix: Number(enPromo ? p.prix_promo : p.prix_vente),
      prixNormal: Number(p.prix_vente),
      enPromo,
      disponible: p.disponible,
      photo: premiere[p.id] || "",
    };
  }
  return resultat;
}
