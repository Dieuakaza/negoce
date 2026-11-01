import Link from "next/link";
import { getSupabase } from "../../lib/supabase";
import { fcfa } from "../../lib/format";
import { enregistrerVente } from "./actions";

export const dynamic = "force-dynamic";

async function charger() {
  try {
    const supabase = getSupabase();
    const [produits, ventes] = await Promise.all([
      supabase.from("produits").select("id, nom, prix_vente, stock").gt("stock", 0).order("nom"),
      supabase.from("ventes").select("*").order("date_vente", { ascending: false }).limit(30),
    ]);
    const erreur = produits.error?.message || ventes.error?.message || null;
    return { produits: produits.data || [], ventes: ventes.data || [], erreur };
  } catch (e) {
    return { produits: [], ventes: [], erreur: e.message };
  }
}

function formaterDate(date) {
  return new Date(date).toLocaleString("fr-FR", {
    timeZone: "Africa/Abidjan",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function PageVentes({ searchParams }) {
  const params = await searchParams;
  const { produits, ventes, erreur } = await charger();

  return (
    <main className="p-5 pb-24">
      <Link href="/" className="text-sm text-emerald-700">← Accueil</Link>
      <h1 className="mt-2 text-2xl font-bold">Mes ventes</h1>

      {params?.ok && (
        <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
          ✓ Vente enregistrée. Le stock a été mis à jour.
        </div>
      )}
      {params?.erreur && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">
          {params.erreur}
        </div>
      )}
      {erreur && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <p className="font-semibold">Connexion à la base de données impossible</p>
          <p className="mt-1 break-words">{erreur}</p>
        </div>
      )}

      <form action={enregistrerVente} className="mt-5 space-y-3 rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold">Nouvelle vente</h2>
        {produits.length === 0 ? (
          <p className="text-sm text-slate-500">
            Aucun produit en stock.{" "}
            <Link href="/produits" className="font-semibold text-emerald-700">
              Ajoutez d’abord un produit
            </Link>
            .
          </p>
        ) : (
          <>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Produit vendu</span>
              <select
                name="produit_id"
                required
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              >
                {produits.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nom} — {fcfa(p.prix_vente)} ({p.stock} en stock)
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Quantité vendue</span>
              <input
                name="quantite"
                type="number"
                required
                min={1}
                step={1}
                defaultValue={1}
                inputMode="numeric"
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-base font-semibold text-white active:bg-emerald-700"
            >
              Enregistrer la vente
            </button>
          </>
        )}
      </form>

      <h2 className="mt-8 text-lg font-semibold">Dernières ventes</h2>
      {ventes.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">Aucune vente pour l’instant.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {ventes.map((v) => {
            const total = v.quantite * Number(v.prix_vente_unitaire);
            const gain = v.quantite * (Number(v.prix_vente_unitaire) - Number(v.prix_achat_unitaire));
            return (
              <li key={v.id} className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{v.produit_nom}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {v.quantite} × {fcfa(v.prix_vente_unitaire)} · {formaterDate(v.date_vente)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{fcfa(total)}</p>
                    <p className={"mt-1 text-xs font-semibold " + (gain >= 0 ? "text-emerald-700" : "text-red-600")}>
                      {gain >= 0 ? "+" : ""}{fcfa(gain)}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
