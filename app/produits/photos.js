"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabase } from "../../lib/supabase";

const MAX_PHOTOS = 6;

export async function ajouterPhoto(formData) {
  const produitId = String(formData.get("produit_id") || "");
  const fichier = formData.get("photo");
  if (!produitId || !fichier || typeof fichier === "string") {
    return { ok: false, message: "Photo manquante." };
  }
  if (fichier.size > 1024 * 1024) {
    return { ok: false, message: "La photo est trop lourde." };
  }

  const supabase = getSupabase();

  const { data: boutiques } = await supabase.from("boutiques").select("id").limit(1);
  const boutiqueId = boutiques?.[0]?.id;
  if (!boutiqueId) return { ok: false, message: "Boutique introuvable. Reconnecte-toi." };

  const { data: existantes, error: erreurLecture } = await supabase
    .from("produit_photos")
    .select("id, ordre")
    .eq("produit_id", produitId);
  if (erreurLecture) return { ok: false, message: erreurLecture.message };
  if (existantes.length >= MAX_PHOTOS) {
    return { ok: false, message: "Maximum " + MAX_PHOTOS + " photos par produit." };
  }

  const chemin =
    boutiqueId + "/" + produitId + "-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8) + ".jpg";
  const contenu = await fichier.arrayBuffer();

  const { error: erreurEnvoi } = await supabase.storage
    .from("produits")
    .upload(chemin, contenu, { contentType: "image/jpeg", upsert: false });
  if (erreurEnvoi) return { ok: false, message: "Envoi impossible : " + erreurEnvoi.message };

  const ordre = existantes.length > 0 ? Math.max(...existantes.map((x) => x.ordre)) + 1 : 0;
  const { error: erreurBase } = await supabase
    .from("produit_photos")
    .insert({ produit_id: produitId, chemin, ordre });
  if (erreurBase) {
    await supabase.storage.from("produits").remove([chemin]);
    return { ok: false, message: "Enregistrement impossible : " + erreurBase.message };
  }

  revalidatePath("/produits");
  return { ok: true };
}

export async function supprimerPhoto(photoId) {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("produit_photos")
    .select("id, chemin")
    .eq("id", photoId)
    .limit(1);
  const photo = data?.[0];
  if (!photo) return { ok: false, message: "Photo introuvable." };

  const { error } = await supabase.from("produit_photos").delete().eq("id", photoId);
  if (error) return { ok: false, message: error.message };

  await supabase.storage.from("produits").remove([photo.chemin]);
  revalidatePath("/produits");
  return { ok: true };
}

export async function photoEnPremier(photoId) {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("produit_photos")
    .select("id, produit_id")
    .eq("id", photoId)
    .limit(1);
  const photo = data?.[0];
  if (!photo) return { ok: false, message: "Photo introuvable." };

  const { data: premieres } = await supabase
    .from("produit_photos")
    .select("ordre")
    .eq("produit_id", photo.produit_id)
    .order("ordre", { ascending: true })
    .limit(1);
  const plusPetit = premieres?.[0]?.ordre ?? 0;

  const { error } = await supabase
    .from("produit_photos")
    .update({ ordre: plusPetit - 1 })
    .eq("id", photoId);
  if (error) return { ok: false, message: error.message };

  revalidatePath("/produits");
  return { ok: true };
}

// Supprime un produit ET ses photos (pour ne pas laisser de fichiers inutiles)
export async function supprimerProduitEtPhotos(formData) {
  const id = String(formData.get("id") || "");
  if (!id) return;

  const supabase = getSupabase();
  const { data: photos } = await supabase.from("produit_photos").select("chemin").eq("produit_id", id);

  const { error } = await supabase.from("produits").delete().eq("id", id);
  if (error) {
    redirect("/produits?erreur=" + encodeURIComponent("Suppression impossible : " + error.message));
  }

  if (photos && photos.length > 0) {
    await supabase.storage.from("produits").remove(photos.map((p) => p.chemin));
  }

  revalidatePath("/produits");
  redirect("/produits?ok=supprime");
}
