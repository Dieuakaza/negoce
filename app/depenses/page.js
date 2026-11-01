import Link from "next/link";
import { getSupabase } from "../../lib/supabase";
import { fcfa } from "../../lib/format";
import { ajouterDepense, supprimerDepense } from "./actions";

export const dynamic = "force-dynamic";

const styleChamp =
  "mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200";

async function charger() {
  try {
    const { data, error } = await getSupabase()
      .from("depenses")
      .select("*")
      .order("date_depense", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) return { depenses: [], erreur: error.message };
    return { depenses: data, erreur: null };
  } catch (e) {
    return { depenses: [], erreur: e.message };
  }
}

function formaterDate(date) {
  return new Date(date + "T00:00:00Z").toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default async function PageDepenses({ searchParams }) {
  const params = await searchParams;
  const { depenses, erreur } = await charger();
  const aujourdhui = new Date().toISOString().slice(0, 10);

  return (
    <main className="p-5 pb-24">
      <Link href="/" className="text-sm text-emerald-700">← Accueil</Link>
      <h1 className="mt-2 text-2xl font-bold">Mes dépenses</h1>

      {params?.ok && (
        <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
          ✓ Dépense enregistrée.
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

      <form action={ajouterDepense} className="mt-5 space-y-3 rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold">Nouvelle dépense</h2>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Description</span>
          <input name="description" type="text" required placeholder="Ex : Transport, loyer, sacs…" className={styleChamp} />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Montant (FCFA)</span>
          <input name="montant" type="number" required min={1} step={1} inputMode="numeric" placeholder="Ex : 2000" className={styleChamp} />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Date</span>
          <input name="date_depense" type="date" required defaultValue={aujourdhui} className={styleChamp} />
        </label>
        <button
          type="submit"
          className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-base font-semibold text-white active:bg-emerald-700"
        >
          Enregistrer la dépense
        </button>
      </form>

      <h2 className="mt-8 text-lg font-semibold">Dernières dépenses</h2>
      {depenses.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">Aucune dépense pour l’instant.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {depenses.map((d) => (
            <li key={d.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{d.description}</p>
                  <p className="mt-1 text-xs text-slate-500">{formaterDate(d.date_depense)}</p>
                </div>
                <p className="font-semibold text-red-600">− {fcfa(d.montant)}</p>
              </div>
              <details className="mt-3">
                <summary className="cursor-pointer text-sm font-semibold text-red-600">Supprimer</summary>
                <form action={supprimerDepense} className="mt-3 space-y-3">
                  <input type="hidden" name="id" value={d.id} />
                  <p className="text-sm text-slate-600">Supprimer cette dépense définitivement ?</p>
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-red-600 px-4 py-3 text-base font-semibold text-white active:bg-red-700"
                  >
                    Oui, supprimer
                  </button>
                </form>
              </details>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
