import { getSupabase } from "../../lib/supabase";
import { fcfa } from "../../lib/format";
import { ajouterDepense, supprimerDepense } from "./actions";
import Icone from "../../components/Icone";
import BoutonEnvoi from "../../components/BoutonEnvoi";
import { EnTete, Alerte, Deplier, EtatVide, styleChamp } from "../../components/ui";

export const dynamic = "force-dynamic";

const SUGGESTIONS = [
  "Transport",
  "Loyer",
  "Électricité",
  "Emballages",
  "Réapprovisionnement",
  "Téléphone et internet",
  "Taxes et patente",
  "Salaire",
];

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
    <main className="p-5 pb-28">
      <EnTete titre="Dépenses" icone="billet" sous="Notez ce que vous dépensez pour votre commerce" />

      {params?.ok && <Alerte>Dépense enregistrée.</Alerte>}
      {params?.erreur && <Alerte type="erreur">{params.erreur}</Alerte>}
      {erreur && (
        <Alerte type="erreur">
          <p>Connexion à la base de données impossible</p>
          <p className="mt-1 font-normal">{erreur}</p>
        </Alerte>
      )}

      <form
        action={ajouterDepense}
        className="mt-5 space-y-3 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100"
      >
        <h2 className="text-base font-semibold">Nouvelle dépense</h2>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Description</span>
          <input
            name="description"
            type="text"
            required
            list="suggestions"
            placeholder="Ex : Transport, loyer, sacs…"
            className={styleChamp}
          />
          <datalist id="suggestions">
            {SUGGESTIONS.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Montant (FCFA)</span>
          <input
            name="montant"
            type="number"
            required
            min={1}
            step={1}
            inputMode="numeric"
            placeholder="Ex : 2000"
            className={styleChamp}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Date</span>
          <input
            name="date_depense"
            type="date"
            required
            defaultValue={aujourdhui}
            className={styleChamp + " min-w-0"}
          />
        </label>
        <BoutonEnvoi>Enregistrer la dépense</BoutonEnvoi>
      </form>

      <h2 className="mt-8 text-lg font-semibold">Dernières dépenses</h2>
      {depenses.length === 0 ? (
        <EtatVide
          icone="billet"
          titre="Aucune dépense pour l’instant"
          texte="Vos dépenses apparaîtront ici et seront déduites de votre bénéfice."
        />
      ) : (
        <ul className="mt-3 space-y-3">
          {depenses.map((d) => (
            <li key={d.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                  <Icone nom="billet" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{d.description}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{formaterDate(d.date_depense)}</p>
                </div>
                <p className="shrink-0 font-bold text-red-600">− {fcfa(d.montant)}</p>
              </div>
              <Deplier titre="Supprimer" icone="corbeille" ton="danger">
                <form action={supprimerDepense} className="mt-3 space-y-3">
                  <input type="hidden" name="id" value={d.id} />
                  <p className="text-sm text-slate-600">Supprimer cette dépense définitivement ?</p>
                  <BoutonEnvoi ton="rouge">Oui, supprimer</BoutonEnvoi>
                </form>
              </Deplier>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
