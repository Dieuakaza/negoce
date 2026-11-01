import Link from "next/link";
import { getSupabase } from "../lib/supabase";
import { fcfa } from "../lib/format";

export const dynamic = "force-dynamic";

const PERIODES = [
  { cle: "jour", nom: "Aujourd’hui" },
  { cle: "mois", nom: "Ce mois" },
  { cle: "tout", nom: "Tout" },
];

function debutPeriode(cle) {
  if (cle === "tout") return null;
  // La Côte d’Ivoire est à l’heure UTC : aucun décalage à gérer
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  if (cle === "mois") d.setUTCDate(1);
  return d;
}

// Lit toutes les lignes, par paquets de 1000
async function toutLire(construire) {
  let tout = [];
  for (let page = 0; page < 50; page++) {
    const { data, error } = await construire().range(page * 1000, page * 1000 + 999);
    if (error) throw new Error(error.message);
    tout = tout.concat(data);
    if (data.length < 1000) break;
  }
  return tout;
}

async function charger(cle) {
  const vide = { chiffre: 0, gainVentes: 0, totalDepenses: 0, nbVentes: 0, benefice: 0, faibles: [], erreur: null };
  try {
    const supabase = getSupabase();
    const debut = debutPeriode(cle);

    const ventes = await toutLire(() => {
      let q = supabase.from("ventes").select("quantite, prix_vente_unitaire, prix_achat_unitaire");
      if (debut) q = q.gte("date_vente", debut.toISOString());
      return q.order("id");
    });

    const depenses = await toutLire(() => {
      let q = supabase.from("depenses").select("montant");
      if (debut) q = q.gte("date_depense", debut.toISOString().slice(0, 10));
      return q.order("id");
    });

    const { data: faibles, error } = await supabase
      .from("produits")
      .select("id, nom, stock")
      .lte("stock", 3)
      .order("stock")
      .limit(10);
    if (error) throw new Error(error.message);

    let chiffre = 0;
    let gainVentes = 0;
    for (const v of ventes) {
      const pv = Number(v.prix_vente_unitaire);
      const pa = Number(v.prix_achat_unitaire);
      chiffre += v.quantite * pv;
      gainVentes += v.quantite * (pv - pa);
    }
    const totalDepenses = depenses.reduce((somme, d) => somme + Number(d.montant), 0);

    return {
      chiffre,
      gainVentes,
      totalDepenses,
      nbVentes: ventes.length,
      benefice: gainVentes - totalDepenses,
      faibles,
      erreur: null,
    };
  } catch (e) {
    return { ...vide, erreur: e.message };
  }
}

function Carte({ titre, valeur }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <p className="text-xs text-slate-500">{titre}</p>
      <p className="mt-1 break-words text-lg font-bold">{valeur}</p>
    </div>
  );
}

export default async function Accueil({ searchParams }) {
  const params = await searchParams;
  const cle = PERIODES.some((p) => p.cle === params?.periode) ? params.periode : "mois";
  const r = await charger(cle);

  return (
    <main className="p-5 pb-28">
      <h1 className="text-xl font-bold">Negoce</h1>
      <p className="text-sm text-slate-500">Votre tableau de bord</p>

      <div className="mt-4 flex gap-2">
        {PERIODES.map((p) => (
          <Link
            key={p.cle}
            href={"/?periode=" + p.cle}
            className={
              "flex-1 rounded-full px-3 py-2 text-center text-sm font-semibold " +
              (p.cle === cle ? "bg-slate-900 text-white" : "bg-white text-slate-700 shadow-sm")
            }
          >
            {p.nom}
          </Link>
        ))}
      </div>

      {r.erreur && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <p className="font-semibold">Connexion à la base de données impossible</p>
          <p className="mt-1 break-words">{r.erreur}</p>
        </div>
      )}

      <div
        className={
          "mt-4 rounded-3xl p-6 text-white shadow-lg " + (r.benefice < 0 ? "bg-red-600" : "bg-emerald-600")
        }
      >
        <p className="text-sm opacity-90">Bénéfice estimé</p>
        <p className="mt-1 text-3xl font-bold">{fcfa(r.benefice)}</p>
        <p className="mt-3 text-xs opacity-90">
          Gain sur les ventes ({fcfa(r.gainVentes)}) moins les dépenses ({fcfa(r.totalDepenses)})
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Carte titre="Chiffre d’affaires" valeur={fcfa(r.chiffre)} />
        <Carte titre="Dépenses" valeur={fcfa(r.totalDepenses)} />
        <Carte titre="Nombre de ventes" valeur={String(r.nbVentes)} />
        <Carte titre="Gain sur les ventes" valeur={fcfa(r.gainVentes)} />
      </div>

      {r.faibles.length > 0 && (
        <div className="mt-5 rounded-2xl bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-800">À réapprovisionner</p>
          <ul className="mt-2 space-y-1 text-sm text-amber-900">
            {r.faibles.map((p) => (
              <li key={p.id} className="flex justify-between">
                <span>{p.nom}</span>
                <span className="font-semibold">
                  {p.stock === 0 ? "Épuisé" : p.stock + " restant" + (p.stock > 1 ? "s" : "")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
