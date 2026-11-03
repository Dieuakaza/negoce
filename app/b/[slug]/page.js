import Link from "next/link";
import { cache } from "react";
import { notFound } from "next/navigation";
import { getSupabasePublic } from "../../../lib/supabase-public";
import { urlPhoto } from "../../../lib/photos";
import { fcfa } from "../../../lib/format";
import BoutonPartager from "../../../components/BoutonPartager";
import BoutonWhatsapp from "../../../components/BoutonWhatsapp";

export const revalidate = 30;

const charger = cache(async (slug) => {
  const supabase = getSupabasePublic();
  const { data: boutiques } = await supabase
    .from("boutiques_publiques")
    .select("*")
    .eq("slug", slug)
    .limit(1);
  const boutique = boutiques?.[0];
  if (!boutique) return null;

  const [produits, photos] = await Promise.all([
    supabase
      .from("produits_publics")
      .select("*")
      .eq("boutique_slug", slug)
      .order("created_at", { ascending: false }),
    supabase
      .from("photos_publiques")
      .select("produit_id, chemin, ordre")
      .eq("boutique_slug", slug)
      .order("ordre", { ascending: true }),
  ]);

  const premiere = {};
  for (const ph of photos.data || []) {
    if (!premiere[ph.produit_id]) premiere[ph.produit_id] = urlPhoto(ph.chemin);
  }
  return { boutique, produits: produits.data || [], premiere };
});

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const donnees = await charger(slug);
  if (!donnees) return { title: "Boutique introuvable — NEGOCE" };

  const { boutique, produits, premiere } = donnees;
  const titre = boutique.nom + (boutique.ville ? " · " + boutique.ville : "");
  const description =
    boutique.description || "Découvre les produits de " + boutique.nom + " et commande sur WhatsApp.";
  const image = produits.map((p) => premiere[p.id]).find(Boolean);

  return {
    title: titre,
    description,
    openGraph: {
      title: titre,
      description,
      type: "website",
      locale: "fr_FR",
      siteName: "NEGOCE",
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function PageBoutiquePublique({ params }) {
  const { slug } = await params;
  const donnees = await charger(slug);
  if (!donnees) notFound();

  const { boutique, produits, premiere } = donnees;
  const message =
    "Bonjour " + boutique.nom + ", j’ai vu votre boutique en ligne et je souhaite des informations.";

  return (
    <main className="pb-10">
      <header className="bg-[linear-gradient(135deg,#10b981,#047857)] px-5 pb-8 pt-8 text-white">
        <div className="flex items-center gap-3">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl font-extrabold text-emerald-700">
            {boutique.nom.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold leading-tight">{boutique.nom}</h1>
            {boutique.ville && <p className="text-sm text-white/80">{boutique.ville}</p>}
          </div>
        </div>

        {boutique.description && (
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-white/90">
            {boutique.description}
          </p>
        )}

        <div className="mt-5 grid grid-cols-2 gap-3">
          {boutique.whatsapp && (
            <a
              href={"https://wa.me/" + boutique.whatsapp + "?text=" + encodeURIComponent(message)}
              className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-emerald-700 active:bg-emerald-50"
            >
              Écrire sur WhatsApp
            </a>
          )}
          <BoutonPartager
            titre={boutique.nom}
            texte={"Découvre la boutique " + boutique.nom}
            className="flex items-center justify-center gap-2 rounded-xl bg-white/15 px-4 py-3 text-sm font-semibold text-white ring-1 ring-white/30 active:bg-white/25"
          />
        </div>
      </header>

      <section className="px-5 pt-6">
        <h2 className="text-lg font-bold">Nos produits</h2>

        {produits.length === 0 ? (
          <p className="mt-4 rounded-2xl bg-white p-6 text-center text-sm text-slate-500 shadow-sm ring-1 ring-slate-100">
            Les produits arrivent bientôt. Écris-nous sur WhatsApp pour en savoir plus.
          </p>
        ) : (
          <ul className="mt-4 grid grid-cols-2 gap-3">
            {produits.map((p) => {
              const enPromo = p.prix_promo !== null && p.prix_promo !== undefined;
              const epuise = p.disponible <= 0;
              return (
                <li key={p.id}>
                  <Link
                    href={"/b/" + boutique.slug + "/p/" + p.id}
                    className="block overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 active:opacity-90"
                  >
                    <div className="relative aspect-square bg-slate-100">
                      {premiere[p.id] ? (
                        <img
                          src={premiere[p.id]}
                          alt={p.nom}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-slate-300">
                          {p.nom.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {enPromo && !epuise && (
                        <span className="absolute left-2 top-2 rounded-full bg-rose-600 px-2.5 py-0.5 text-xs font-bold text-white">
                          Promo
                        </span>
                      )}
                      {epuise && (
                        <span className="absolute inset-0 flex items-center justify-center bg-white/70 text-sm font-bold text-slate-700">
                          Épuisé
                        </span>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="line-clamp-2 text-sm font-semibold leading-snug">{p.nom}</h3>
                      <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
                        <span className={"font-bold " + (enPromo ? "text-rose-600" : "")}>
                          {fcfa(enPromo ? p.prix_promo : p.prix_vente)}
                        </span>
                        {enPromo && (
                          <span className="text-xs text-slate-400 line-through">{fcfa(p.prix_vente)}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <footer className="mt-10 px-5 text-center">
        <Link href="/connexion?mode=inscription" className="text-xs text-slate-400">
          Boutique créée avec <span className="font-bold tracking-[0.15em]">NEGOCE</span> · Vends mieux. Gère simplement.
        </Link>
      </footer>
    </main>
  );
}
