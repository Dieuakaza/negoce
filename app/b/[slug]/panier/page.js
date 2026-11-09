import { notFound } from "next/navigation";
import { getSupabasePublic } from "../../../../lib/supabase-public";
import PanierClient from "../../../../components/PanierClient";

export const metadata = { title: "Mon panier — NEGOCE", robots: { index: false } };
export const revalidate = 30;

export default async function PagePanier({ params }) {
  const { slug } = await params;
  const { data } = await getSupabasePublic()
    .from("boutiques_publiques")
    .select("nom, whatsapp, slug")
    .eq("slug", slug)
    .limit(1);
  const boutique = data?.[0];
  if (!boutique) notFound();

  return <PanierClient slug={boutique.slug} nomBoutique={boutique.nom} whatsapp={boutique.whatsapp} />;
}
