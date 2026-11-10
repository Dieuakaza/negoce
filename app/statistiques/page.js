import Link from "next/link";
import { getSupabase } from "../../lib/supabase";
import { fcfa } from "../../lib/format";
import { EnTete, Alerte, EtatVide } from "../../components/ui";

export const dynamic = "force-dynamic";

const PERIODES = [
  { cle: "7j", nom: "7 jours" },
  { cle: "30j", nom: "30 jours" },
  { cle: "mois", nom: "Ce mois" },
  { cle: "tout", nom: "Tout" },
];

const MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
const JOUR = 24 * 3600 * 1000;

// La Côte d’Ivoire est à l’heure UTC : aucun décalage à gérer
function jourUTC(date) {
  return date.toISOString().slice(0, 10);
}
function aujourdhui() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}
function ajouter(date, jours) {
  return new Date(date.getTime() + jours * JOUR);
}
function libelleJour(cle) {
  const [, m, j] = cle.split("-").map(Number);
  return j + " " + MOIS[m - 1];
}

// Période choisie et période juste avant, pour comparer
function calculerPeriode(cle) {
  const auj = aujourdhui();
  const demain = ajouter(auj, 1);
  if (cle === "7j") {
    const debut = ajouter(auj, -6);
    return { debut, fin: demain, precDebut: ajouter(debut, -7), precFin: debut };
  }
  if (cle === "30j") {
    const debut = ajouter(auj, -29);
    return { debut, fin: demain, precDebut: ajouter(debut, -30), precFin: debut };
  }
  if (cle === "mois") {
    const debut = new Date(Date.UTC(auj.getUTCFullYear(), auj.getUTCMonth(), 1));
    const jours = Math.round((demain - debut) / JOUR);
    const precDebut = new Date(Date.UTC(auj.getUTCFullYear(), auj.getUTCMonth() - 1, 1));
    return { debut, fin: demain, precDebut, precFin: ajouter(precDebut, jours) };
  }
  return { debut: null, fin: demain, precDebut: null, precFin: null };
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

function dansPeriode(jour, debut, fin) {
  if (debut && jour < jourUTC(debut)) return false;
  if (fin && jour >= jourUTC(fin)) return false;
  return true;
}

function totaux(lignes) {
  let ca = 0;
  let gain = 0;
  let pieces = 0;
  for (const v of lignes) {
    const pv = Number(v.prix_vente_unitaire);
    const pa = Number(v.prix_achat_unitaire);
    ca += v.quantite * pv;
    gain += v.quantite * (pv - pa);
    pieces += v.quantite;
  }
  return { ca, gain, pieces };
}

async function charger(cle, tri) {
  try {
    const supabase = getSupabase();
    const periode = calculerPeriode(cle);
    const depart = periode.precDebut || periode.debut;

    const toutesVentes = await toutLire(() => {
      let q = supabase
        .from("ventes")
        .select("produit_id, produit_nom, quantite, prix_vente_unitaire, prix_achat_unitaire, date_vente, commande_id");
      if (depart) q = q.gte("date_vente", depart.toISOString());
      return q.order("id");
    });
    const toutesDepenses = await toutLire(() => {
      let q = supabase.from("depenses").select("montant, date_depense");
      if (depart) q = q.gte("date_depense", jourUTC(depart));
      return q.order("id");
    });
    const { data: produits, error } = await supabase
      .from("produits")
      .select("id, nom, stock, prix_achat")
      .order("nom")
      .limit(1000);
    if (error) throw new Error(error.message);

    const actuelles = toutesVentes.filter((v) =>
      dansPeriode(v.date_vente.slice(0, 10), periode.debut, periode.fin)
    );
    const precedentes = periode.precDebut
      ? toutesVentes.filter((v) => dansPeriode(v.date_vente.slice(0, 10), periode.precDebut, periode.precFin))
      : null;

    const dep = toutesDepenses
      .filter((d) => dansPeriode(d.date_depense, periode.debut, periode.fin))
      .reduce((s, d) => s + Number(d.montant), 0);
    const depPrec = periode.precDebut
      ? toutesDepenses
          .filter((d) => dansPeriode(d.date_depense, periode.precDebut, periode.precFin))
          .reduce((s, d) => s + Number(d.montant), 0)
      : null;

    const t = totaux(actuelles);
    const tp = precedentes ? totaux(precedentes) : null;

    // Graphique : un bâton par jour (par mois pour « Tout »)
    const barres = [];
    if (cle === "tout") {
      const auj = aujourdhui();
      for (let i = 11; i >= 0; i--) {
        const d = new Date(Date.UTC(auj.getUTCFullYear(), auj.getUTCMonth() - i, 1));
        barres.push({
          cle: d.toISOString().slice(0, 7),
          label: MOIS[d.getUTCMonth()] + " " + d.getUTCFullYear(),
          ca: 0,
        });
      }
      for (const v of actuelles) {
        const b = barres.find((x) => x.cle === v.date_vente.slice(0, 7));
        if (b) b.ca += v.quantite * Number(v.prix_vente_unitaire);
      }
    } else {
      const index = new Map();
      for (let d = new Date(periode.debut); d < periode.fin; d = ajouter(d, 1)) {
        const k = jourUTC(d);
        const b = { cle: k, label: libelleJour(k), ca: 0 };
        barres.push(b);
        index.set(k, b);
      }
      for (const v of actuelles) {
        const b = index.get(v.date_vente.slice(0, 10));
        if (b) b.ca += v.quantite * Number(v.prix_vente_unitaire);
      }
    }

    // Produits les plus vendus
    const parProduit = new Map();
    for (const v of actuelles) {
      const k = v.produit_id || "nom:" + v.produit_nom;
      const e = parProduit.get(k) || { nom: v.produit_nom, pieces: 0, ca: 0, gain: 0 };
      e.nom = v.produit_nom;
      e.pieces += v.quantite;
      e.ca += v.quantite * Number(v.prix_vente_unitaire);
      e.gain += v.quantite * (Number(v.prix_vente_unitaire) - Number(v.prix_achat_unitaire));
      parProduit.set(k, e);
    }
    const valeurTri = (e) => (tri === "gain" ? e.gain : e.pieces);
    const classement = [...parProduit.values()].sort((a, b) => valeurTri(b) - valeurTri(a)).slice(0, 5);

    // Produits en stock qui ne se sont pas vendus sur la période
    const vendus = new Set(actuelles.map((v) => v.produit_id).filter(Boolean));
    const dormants = produits
      .filter((p) => p.stock > 0 && !vendus.has(p.id))
      .sort((a, b) => b.stock * Number(b.prix_achat) - a.stock * Number(a.prix_achat))
      .slice(0, 5);

    const valeurStock = produits.reduce((s, p) => s + p.stock * Number(p.prix_achat), 0);
    const caEnLigne = actuelles
      .filter((v) => v.commande_id)
      .reduce((s, v) => s + v.quantite * Number(v.prix_vente_unitaire), 0);

    return {
      erreur: null,
      periode,
      t,
      tp,
      dep,
      depPrec,
      barres,
      classement,
      valeurTri,
      dormants,
      valeurStock,
      caEnLigne,
      aDesVentes: actuelles.length > 0,
    };
  } catch (e) {
    return { erreur: e.message };
  }
}

function Variation({ actuel, precedent }) {
  if (precedent === null || precedent === undefined) return null;
  if (precedent === 0) {
    return actuel > 0 ? <span className="text-xs font-semibold text-emerald-600">nouveau</span> : null;
  }
  const pct = Math.round(((actuel - precedent) / Math.abs(precedent)) * 100);
  if (pct === 0) return <span className="text-xs text-slate-400">stable</span>;
  return (
    <span className={"text-xs font-semibold " + (pct > 0 ? "text-emerald-600" : "text-red-600")}>
      {pct > 0 ? "▲ +" : "▼ "}
      {pct} %
    </span>
  );
}

function Carte({ titre, valeur, variation, ton = "" }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <p className="text-xs text-slate-500">{titre}</p>
      <p className={"mt-1 break-words text-lg font-bold " + ton}>{valeur}</p>
      <div className="mt-1 min-h-4">{variation}</div>
    </div>
  );
}

export default async function PageStatistiques({ searchParams }) {
  const params = await searchParams;
  const cle = PERIODES.some((p) => p.cle === params?.periode) ? params.periode : "30j";
  const tri = params?.tri === "gain" ? "gain" : "pieces";
  const r = await charger(cle, tri);

  const lien = (periode, ordre) => "/statistiques?periode=" + periode + "&tri=" + ordre;

  if (r.erreur) {
    return (
      <main className="p-5 pb-28">
        <EnTete titre="Statistiques" icone="graphique" />
        <Alerte type="erreur">
          <p>Connexion à la base de données impossible</p>
          <p className="mt-1 font-normal">{r.erreur}</p>
        </Alerte>
      </main>
    );
  }

  const { t, tp, dep, depPrec, barres, classement, valeurTri, dormants, valeurStock, caEnLigne } = r;
  const benefice = t.gain - dep;
  const beneficePrec = tp ? tp.gain - depPrec : null;
  const marge = t.ca > 0 ? Math.round((t.gain / t.ca) * 100) : 0;
  const caBoutique = t.ca - caEnLigne;
  const maxBarre = Math.max(1, ...barres.map((b) => b.ca));
  const meilleur = barres.reduce((m, b) => (b.ca > m.ca ? b : m), { ca: 0 });
  const maxClassement = classement.length > 0 ? Math.max(1, valeurTri(classement[0])) : 1;

  return (
    <main className="p-5 pb-28">
      <EnTete titre="Statistiques" icone="graphique" sous="Comprends ce qui se vend vraiment" />

      <div className="mt-5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        {PERIODES.map((p) => (
          <Link
            key={p.cle}
            href={lien(p.cle, tri)}
            className={
              "shrink-0 rounded-full px-4 py-2 text-sm font-semibold " +
              (p.cle === cle ? "bg-slate-900 text-white" : "bg-white text-slate-700 shadow-sm ring-1 ring-slate-100")
            }
          >
            {p.nom}
          </Link>
        ))}
      </div>

      {!r.aDesVentes && (
        <EtatVide
          icone="graphique"
          titre="Pas encore de ventes sur cette période"
          texte="Dès que tu enregistres ou livres des ventes, tes statistiques apparaissent ici."
        />
      )}

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Carte
          titre="Chiffre d’affaires"
          valeur={fcfa(t.ca)}
          variation={tp ? <Variation actuel={t.ca} precedent={tp.ca} /> : null}
        />
        <Carte
          titre="Gain sur les ventes"
          valeur={fcfa(t.gain)}
          variation={tp ? <Variation actuel={t.gain} precedent={tp.gain} /> : null}
        />
        <Carte titre="Dépenses" valeur={fcfa(dep)} variation={depPrec !== null ? <Variation actuel={dep} precedent={depPrec} /> : null} />
        <Carte
          titre="Bénéfice estimé"
          valeur={fcfa(benefice)}
          ton={benefice < 0 ? "text-red-600" : "text-emerald-700"}
          variation={beneficePrec !== null ? <Variation actuel={benefice} precedent={beneficePrec} /> : null}
        />
        <Carte
          titre="Pièces vendues"
          valeur={String(t.pieces)}
          variation={tp ? <Variation actuel={t.pieces} precedent={tp.pieces} /> : null}
        />
        <Carte titre="Taux de marge" valeur={marge + " %"} />
      </div>
      {tp && <p className="mt-2 text-xs text-slate-400">Les flèches comparent à la période juste avant.</p>}

      <section className="mt-5 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <h2 className="text-base font-bold">{cle === "tout" ? "Ventes par mois" : "Ventes par jour"}</h2>
        <div className="mt-4 flex h-36 items-end gap-[3px]">
          {barres.map((b) => (
            <div key={b.cle} className="flex h-full flex-1 flex-col justify-end" title={b.label + " : " + fcfa(b.ca)}>
              <div
                className={"w-full rounded-t " + (b.ca > 0 ? "bg-emerald-500" : "bg-slate-200")}
                style={{ height: (b.ca > 0 ? Math.max(4, Math.round((b.ca / maxBarre) * 100)) : 2) + "%" }}
              />
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-slate-400">
          <span>{barres[0]?.label}</span>
          <span>{barres[barres.length - 1]?.label}</span>
        </div>
        {meilleur.ca > 0 && (
          <p className="mt-3 text-sm text-slate-600">
            Meilleur {cle === "tout" ? "mois" : "jour"} : <span className="font-semibold">{meilleur.label}</span> avec{" "}
            <span className="font-semibold">{fcfa(meilleur.ca)}</span>.
          </p>
        )}
      </section>

      <section className="mt-5 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <h2 className="text-base font-bold">En boutique ou en ligne</h2>
        {t.ca > 0 ? (
          <>
            <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-slate-100">
              <div className="bg-sky-500" style={{ width: Math.round((caBoutique / t.ca) * 100) + "%" }} />
              <div className="bg-emerald-500" style={{ width: Math.round((caEnLigne / t.ca) * 100) + "%" }} />
            </div>
            <div className="mt-3 flex justify-between gap-3 text-sm">
              <div>
                <p className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="h-2.5 w-2.5 rounded-full bg-sky-500" /> En boutique
                </p>
                <p className="font-bold">{fcfa(caBoutique)}</p>
              </div>
              <div className="text-right">
                <p className="flex items-center justify-end gap-2 text-xs text-slate-500">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> En ligne
                </p>
                <p className="font-bold">{fcfa(caEnLigne)}</p>
              </div>
            </div>
          </>
        ) : (
          <p className="mt-2 text-sm text-slate-500">Aucune vente sur cette période.</p>
        )}
      </section>

      <section className="mt-5 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <h2 className="text-base font-bold">Produits les plus vendus</h2>
        <div className="mt-3 flex gap-2">
          <Link
            href={lien(cle, "pieces")}
            className={
              "rounded-full px-3 py-1.5 text-xs font-semibold " +
              (tri === "pieces" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700")
            }
          >
            Par pièces vendues
          </Link>
          <Link
            href={lien(cle, "gain")}
            className={
              "rounded-full px-3 py-1.5 text-xs font-semibold " +
              (tri === "gain" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700")
            }
          >
            Par gain
          </Link>
        </div>

        {classement.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">Aucune vente sur cette période.</p>
        ) : (
          <ol className="mt-4 space-y-4">
            {classement.map((e, i) => (
              <li key={e.nom + i}>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="min-w-0 truncate text-sm font-semibold">
                    {i + 1}. {e.nom}
                  </p>
                  <p className="shrink-0 text-sm font-bold">
                    {tri === "gain" ? fcfa(e.gain) : e.pieces + " pièce" + (e.pieces > 1 ? "s" : "")}
                  </p>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: Math.max(4, Math.round((valeurTri(e) / maxClassement) * 100)) + "%" }}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {e.pieces} pièce{e.pieces > 1 ? "s" : ""} · {fcfa(e.ca)} de ventes · {fcfa(e.gain)} de gain
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="mt-5 rounded-3xl bg-amber-50 p-4">
        <h2 className="text-base font-bold text-amber-900">Produits qui ne se vendent pas</h2>
        <p className="mt-1 text-xs text-amber-800">En stock, mais sans aucune vente sur cette période.</p>
        {dormants.length === 0 ? (
          <p className="mt-3 text-sm text-amber-900">Tous tes produits en stock se sont vendus. Bravo !</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm text-amber-900">
            {dormants.map((p) => (
              <li key={p.id} className="flex justify-between gap-3">
                <span className="min-w-0 truncate">
                  {p.nom} <span className="text-amber-700">({p.stock} en stock)</span>
                </span>
                <span className="shrink-0 font-semibold">{fcfa(p.stock * Number(p.prix_achat))}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 border-t border-amber-200 pt-3 text-sm text-amber-900">
          Argent immobilisé dans tout ton stock (au prix d’achat) :{" "}
          <span className="font-bold">{fcfa(valeurStock)}</span>
        </p>
      </section>
    </main>
  );
}
