import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabasePublic } from "../../../../lib/supabase-public";
import { fcfa } from "../../../../lib/format";
import Icone from "../../../../components/Icone";

export const metadata = {
  title: "Commande envoyée — NEGOCE",
  robots: { index: false },
};

export default async function PageMerci({ params }) {
  const { slug } = await params;

  const magasin = await cookies();
  let commande = null;
  try {
    commande = JSON.parse(magasin.get("derniere_commande")?.value || "null");
  } catch {
    commande = null;
  }
  if (!commande || commande.slug !== slug) redirect("/b/" + slug);

  const { data } = await getSupabasePublic()
    .from("boutiques_publiques")
    .select("nom, whatsapp")
    .eq("slug", slug)
    .limit(1);
  const boutique = data?.[0];
  if (!boutique) redirect("/b/" + slug);

  const lignes = commande.lignes || [];
  const detail = (l) =>
    [l.taille && "taille " + l.taille, l.couleur && "couleur " + l.couleur].filter(Boolean).join(", ");

  const message = [
    "Bonjour " + boutique.nom + ",",
    "je viens de passer la commande n°" + commande.numero + " sur votre boutique :",
    ...lignes.map(
      (l) =>
        "• " + l.quantite + " × " + l.nom + (detail(l) ? " (" + detail(l) + ")" : "") +
        " — " + fcfa(l.prix * l.quantite)
    ),
    "Total : " + fcfa(commande.total) + " (paiement à la livraison)",
    "",
    "Nom : " + commande.nom,
    "Téléphone : " + commande.telephone,
    "Adresse : " + commande.adresse + (commande.ville ? ", " + commande.ville : ""),
  ].join("\n");

  return (
    <main className="px-5 pb-10 pt-10">
      <div className="flex flex-col items-center text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <Icone nom="verifie" className="h-8 w-8" epaisseur={2.4} />
        </span>
        <h1 className="mt-5 text-2xl font-bold">Merci {commande.nom} !</h1>
        <p className="mt-2 text-sm text-slate-600">
          Ta commande n°{commande.numero} est bien enregistrée. {boutique.nom} va te contacter pour la confirmer.
        </p>
      </div>

      <section className="mt-6 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <ul className="space-y-3">
          {lignes.map((l, i) => (
            <li key={i} className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold">{l.nom}</p>
                <p className="text-xs text-slate-500">
                  {l.quantite} × {fcfa(l.prix)}
                  {detail(l) ? " · " + detail(l) : ""}
                </p>
              </div>
              <p className="shrink-0 font-semibold">{fcfa(l.prix * l.quantite)}</p>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="text-sm text-slate-500">Total à payer à la livraison</span>
          <span className="text-lg font-extrabold">{fcfa(commande.total)}</span>
        </div>
      </section>

      {boutique.whatsapp && (
        <a
          href={"https://wa.me/" + boutique.whatsapp + "?text=" + encodeURIComponent(message)}
          className="mt-6 flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3.5 text-base font-semibold text-white active:bg-emerald-700"
        >
          Envoyer ma commande sur WhatsApp
        </a>
      )}
      <p className="mt-2 text-center text-xs text-slate-500">
        Cela permet au vendeur de te répondre plus vite.
      </p>

      <Link
        href={"/b/" + slug}
        className="mt-6 block text-center text-sm font-semibold text-emerald-700"
      >
        ← Retour à la boutique
      </Link>
    </main>
  );
}
