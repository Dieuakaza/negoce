"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabase } from "../../lib/supabase";

export async function ajouterDepense(formData) {
  const description = String(formData.get("description") || "").trim();
  const montant = Math.round(Number(formData.get("montant")) || 0);
  const date = String(formData.get("date_depense") || "");

  if (!description || montant < 1) {
    redirect("/depenses?erreur=" + encodeURIComponent("Indiquez une description et un montant."));
  }

  const ligne = { description, montant };
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) ligne.date_depense = date;

  const { error } = await getSupabase().from("depenses").insert(ligne);
  if (error) {
    redirect("/depenses?erreur=" + encodeURIComponent(error.message));
  }

  revalidatePath("/depenses");
  revalidatePath("/");
  redirect("/depenses?ok=1");
}

export async function supprimerDepense(formData) {
  const id = String(formData.get("id") || "");
  if (!id) return;
  const { error } = await getSupabase().from("depenses").delete().eq("id", id);
  if (error) {
    redirect("/depenses?erreur=" + encodeURIComponent(error.message));
  }
  revalidatePath("/depenses");
  revalidatePath("/");
}
