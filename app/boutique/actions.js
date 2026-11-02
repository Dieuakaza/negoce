"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabase } from "../../lib/supabase";
import { versLien, versNumeroWhatsapp } from "../../lib/texte";

function retour(cle, message) {
  redirect("/boutique?" + cle + "=" + encodeURIComponent(message));
}

export async function enregistrerBoutique(formData) {
  const id = String(formData.get("id") || "");
  const nom = String(formData.get("nom") || "").trim().slice(0, 60);
  const slug = versLien(formData.get("slug"));
  const whatsapp = versNumeroWhatsapp(formData.get("whatsapp"));
  const ville = String(formData.get("ville") || "").trim().slice(0, 60);
  const description = String(formData.get("description") || "").trim().slice(0, 500);
  const publiee = formData.get("publiee") === "on";

  if (!id || !nom) retour("erreur", "Le nom de la boutique est obligatoire.");
  if (slug && slug.length < 3) {
    retour("erreur", "Le lien doit contenir au moins 3 lettres ou chiffres.");
  }
  if (whatsapp && !/^[0-9]{8,15}$/.test(whatsapp)) {
    retour("erreur", "Le numéro WhatsApp semble incorrect. Vérifie-le, avec l’indicatif du pays.");
  }
  if (publiee && (!slug || !whatsapp)) {
    retour("erreur", "Pour publier ta boutique, choisis un lien et ajoute ton numéro WhatsApp.");
  }

  const { error } = await getSupabase()
    .from("boutiques")
    .update({
      nom,
      slug: slug || null,
      whatsapp: whatsapp || null,
      ville: ville || null,
      description: description || null,
      publiee,
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      retour("erreur", "Ce lien est déjà utilisé par une autre boutique. Choisis-en un autre.");
    }
    retour("erreur", "Enregistrement impossible : " + error.message);
  }

  revalidatePath("/boutique");
  revalidatePath("/compte");
  redirect("/boutique?ok=1");
}
