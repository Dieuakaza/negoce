import Link from "next/link";
import { cache } from "react";
import { notFound } from "next/navigation";
import { getSupabasePublic } from "../../../../../lib/supabase-public";
import { urlPhoto } from "../../../../../lib/photos";
import { fcfa } from "../../../../../lib/format";
import BoutonPartager from "../../../../../components/BoutonPartager";
import BoutonWhatsapp from "../../../../../components/BoutonWhatsapp";

export const revalidate = 30;

const charger = cache(async (slug, id) => {
  const supabase = getSupabasePublic();
  const { data: boutiques } = await supabase
    .from("boutiques_publiques")
    .select("*")
    .eq("slug", slug)
    .limit(1);
  const boutique = boutiques?.[0];
  if (!boutique) return null;

  const [produits, photos] = await Promise.all([
    supabase.from("produits_publics").select("*").eq("boutique_slug", slug).eq("id", id).limit(1),
    supabase
      .from("photos_publiques")
      .select("chemin, ordre")
      .eq("boutique_slug", slug)
      .eq("produit_id", id)
      .order("ordre", { ascending: true }),
  ]);
  const produit = produits.data?.[0];
  if (!produit) return null;

  return { boutique, produit, photos: (photos.data || []).map((x) => urlPhoto(x.chemin)) };
});

export async function generateMetadata({ params }) {
  const { slug, id } = await params;
  const donnees = await charger(slug, id);
  if (!donnees) return { title: "Produit introuvable — NEGOCE" };

  const { boutique, produit, photos } = donnees;
  const prix = produit.prix_promo ?? produit.prix_vente;
  const titre = produit.nom + " — " + fcfa(prix);
  const description = produit.description
    ? produit.description.slice(0, 160)
    : "Disponible chez " + boutique.nom + ". Commande sur WhatsApp.";

  return {
    title: titre + " · " + boutique.nom,
    description,
    openGraph: {
      title: titre,
      description,
      type: "website",
      locale: "fr_FR",
      siteName: boutique.nom,
      ...(photos[0] ? { images: [photos[0]] } : {}),
    },
  };
}

export default async function PageProduitPublic({ params }) {
  const { slug, id } = await params;
  const donnees = await charger(slug, id);
  if (!donnees) notFound();

  const { boutique, produit, photos } = donnees;
  const enPromo = produit.prix_promo !== null && produit.prix_promo !== undefined;
  const prix = enPromo ? Number(produit.prix_promo) : Number(produit.prix_vente);
  const reduction = enPromo ? Math.round((1 - prix / Number(produit.prix_vente)) * 100) : 0;
  const epuise = produit.disponible <= 0;
  const tailles = produit.tailles || [];
  const couleurs = produit.couleurs || [];
  const message = epuise
    ? "Bonjour " + boutique.nom + ", « " + produit.nom + " » sera-t-il bientôt de nouveau disponible ?"
    : "Bonjour " + boutique.nom + ", je souhaite commander « " + produit.nom + " » à " + fcfa(prix) + ".";

  return (
    <main className="pb-32 pt-4">
      <div className="px-5">
        <Link href={"/b/" + boutique.slug} className="text-sm font-semibold text-emerald-700">
          ← {boutique.nom}
        </Link>
      </div>

      <div className="mt-3">
        {photos.length > 0 ? (
          <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none]">
            {photos.map((url, i) => (
              <img
                key={url}
                src={url}
                alt={produit.nom + " — photo " + (i + 1)}
                loading={i === 0 ? "eager" : "lazy"}
                className="aspect-square w-[85%] shrink-0 snap-center rounded-2xl bg-slate-100 object-cover"
              />
            ))}
          </div>
        ) : (
          <div className="mx-5 flex aspect-square items-center justify-center rounded-2xl bg-slate-100 text-6xl font-bold text-slate-300">
            {produit.nom.charAt(0).toUpperCase()}
          </div>
        )}
        {photos.length > 1 && (
          <p className="mt-2 text-center text-xs text-slate-400">
            Fais glisser pour voir les {photos.length} photos
          </p>
        )}
      </div>

      <div className="px-5 pt-5">
        <h1 className="text-2xl font-bold leading-tight">{produit.nom}</h1>

        <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className={"text-2xl font-extrabold " + (enPromo ? "text-rose-600" : "")}>{fcfa(prix)}</span>
          {enPromo && (
            <>
              <span className="text-base text-slate-400 line-through">{fcfa(produit.prix_vente)}</span>
              <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700">
                −{reduction} %
              </span>
            </>
          )}
        </div>

        <p
          className={
            "mt-2 text-sm font-semibold " +
            (epuise ? "text-red-600" : produit.disponible <= 3 ? "text-amber-600" : "text-emerald-600")
          }
        >
          {epuise
            ? "Épuisé"
            : produit.disponible <= 3
            ? "Plus que " + produit.disponible + " disponible" + (produit.disponible > 1 ? "s" : "")
            : "En stock"}
        </p>

        {produit.description && (
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-700">
            {produit.description}
          </p>
        )}

        {tailles.length > 0 && (
          <div className="mt-5">
            <p className="text-sm font-semibold">Tailles</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {tailles.map((t) => (
                <span key={t} className="rounded-xl bg-white px-3.5 py-2 text-sm font-medium shadow-sm ring-1 ring-slate-200">
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {couleurs.length > 0 && (
          <div className="mt-5">
            <p className="text-sm font-semibold">Couleurs</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {couleurs.map((c) => (
                <span key={c} className="rounded-xl bg-white px-3.5 py-2 text-sm font-medium shadow-sm ring-1 ring-slate-200">
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        <BoutonPartager
          titre={produit.nom}
          texte={produit.nom + " — " + fcfa(prix) + " chez " + boutique.nom}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 active:bg-slate-50"
        />
      </div>

      {boutique.whatsapp && (
        <div
          className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white/95 backdrop-blur"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="mx-auto flex max-w-lg items-center gap-3 px-5 py-3">
            <div className="shrink-0">
              <p className="text-xs text-slate-500">Prix</p>
              <p className="font-extrabold">{fcfa(prix)}</p>
            </div>
            <BoutonWhatsapp
              numero={boutique.whatsapp}
              message={message}
              className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 text-center text-base font-semibold text-white active:bg-emerald-700"
            >
              {epuise ? "Demander la disponibilité" : "Commander sur WhatsApp"}
            </BoutonWhatsapp>
          </div>
        </div>
      )}
    </main>
  );
}
