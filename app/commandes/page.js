import Link from "next/link";
import { getSupabase } from "../../lib/supabase";
import { fcfa } from "../../lib/format";
import { changerStatut } from "./actions";
import { EnTete, Alerte, Deplier, EtatVide } from "../../components/ui";
import BoutonEnvoi from "../../components/BoutonEnvoi";

export const dynamic = "force-dynamic";

const VUES = [
  { cle: "traiter", nom: "À traiter", statuts: ["nouvelle"] },
  { cle: "cours", nom: "En cours", statuts: ["confirmee", "preparation", "livraison"] },
  { cle: "livrees", nom: "Livrées", statuts: ["livree"] },
  { cle: "annulees", nom: "Annulées", statuts: ["annulee"] },
];

const STATUTS = {
  nouvelle: { nom: "Nouvelle", style: "bg-amber-100 text-amber-800" },
  confirmee: { nom: "Confirmée", style: "bg-sky-100 text-sky-800" },
  preparation: { nom: "En préparation", style: "bg-violet-100 text-violet-800" },
  livraison: { nom: "En livraison", style: "bg-indigo-100 text-indigo-800" },
  livree: { nom: "Livrée", style: "bg-emerald-100 text-emerald-800" },
  annulee: { nom: "Annulée", style: "bg-slate-200 text-slate-700" },
};

const SUITE = {
  nouvelle: { statut: "confirmee", libelle: "Confirmer la commande" },
  confirmee: { statut: "preparation", libelle: "Passer en préparation" },
  preparation: { statut: "livraison", libelle: "Marquer en livraison" },
  livraison: { statut: "livree", libelle: "Marquer comme livrée" },
};

const MESSAGES = {
  confirmee: "Commande confirmée. Le stock a été mis à jour.",
  preparation: "Commande en préparation.",
  livraison: "Commande en livraison.",
  livree: "Commande livrée. La vente est ajoutée à ton tableau de bord.",
  annulee: "Commande annulée.",
};

const VIDES = {
  traiter: ["Aucune commande à traiter", "Partage le lien de ta boutique pour recevoir tes premières commandes."],
  cours: ["Aucune commande en cours", "Les commandes confirmées apparaissent ici jusqu’à leur livraison."],
  livrees: ["Aucune commande livrée", "Tes commandes livrées apparaîtront ici."],
  annulees: ["Aucune commande annulée", "Les commandes annulées apparaîtront ici."],
};

async function charger() {
  try {
    const supabase = getSupabase();
    const [commandes, boutiques] = await Promise.all([
      supabase
        .from("commandes")
        .select("*, commande_lignes(*)")
        .order("created_at", { ascending: false })
        .limit(200),
      supabase.from("boutiques").select("nom").limit(1),
    ]);
    return {
      commandes: commandes.data || [],
      boutique: boutiques.data?.[0]?.nom || "ma boutique",
      erreur: commandes.error?.message || null,
    };
  } catch (e) {
    return { commandes: [], boutique: "ma boutique", erreur: e.message };
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

function detail(ligne) {
  return [ligne.taille && "taille " + ligne.taille, ligne.couleur && "couleur " + ligne.couleur]
    .filter(Boolean)
    .join(", ");
}

// Message WhatsApp adapté à l’étape de la commande
function messageClient(c, boutique) {
  const debut = "Bonjour " + c.client_nom + ", ";
  const ref = "ta commande n°" + c.numero + " chez " + boutique;
  switch (c.statut) {
    case "nouvelle":
      return debut + "merci pour " + ref + " (" + fcfa(c.total) + "). Peux-tu me confirmer ton adresse de livraison ?";
    case "confirmee":
      return debut + ref + " est confirmée. Total à payer à la livraison : " + fcfa(c.total) + ".";
    case "preparation":
      return debut + ref + " est en cours de préparation.";
    case "livraison":
      return debut + ref + " est en route. Prépare " + fcfa(c.total) + " pour la livraison.";
    case "livree":
      return debut + "merci pour ton achat chez " + boutique + " ! N’hésite pas à partager notre boutique.";
    default:
      return debut + ref + " a été annulée. N’hésite pas à nous écrire pour plus d’informations.";
  }
}

export default async function PageCommandes({ searchParams }) {
  const params = await searchParams;
  const vue = VUES.find((v) => v.cle === params?.vue) || VUES[0];
  const { commandes, boutique, erreur } = await charger();

  const compter = (v) => commandes.filter((c) => v.statuts.includes(c.statut)).length;
  const liste = commandes.filter((c) => vue.statuts.includes(c.statut));

  return (
    <main className="p-5 pb-28">
      <EnTete titre="Commandes" icone="sac" sous="Reçois et suis les commandes de ta boutique" />

      {params?.ok && MESSAGES[params.ok] && <Alerte>{MESSAGES[params.ok]}</Alerte>}
      {params?.erreur && <Alerte type="erreur">{params.erreur}</Alerte>}
      {erreur && (
        <Alerte type="erreur">
          <p>Connexion à la base de données impossible</p>
          <p className="mt-1 font-normal">{erreur}</p>
        </Alerte>
      )}

      <div className="mt-5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        {VUES.map((v) => {
          const actif = v.cle === vue.cle;
          const n = compter(v);
          return (
            <Link
              key={v.cle}
              href={"/commandes?vue=" + v.cle}
              className={
                "flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold " +
                (actif ? "bg-slate-900 text-white" : "bg-white text-slate-700 shadow-sm ring-1 ring-slate-100")
              }
            >
              {v.nom}
              {n > 0 && (
                <span
                  className={
                    "rounded-full px-2 py-0.5 text-xs font-bold " +
                    (actif
                      ? "bg-white/20"
                      : v.cle === "traiter"
                      ? "bg-red-100 text-red-700"
                      : "bg-slate-100 text-slate-600")
                  }
                >
                  {n}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {!erreur && liste.length === 0 && (
        <EtatVide icone="sac" titre={VIDES[vue.cle][0]} texte={VIDES[vue.cle][1]} />
      )}

      <ul className="mt-5 space-y-3">
        {liste.map((c) => {
          const st = STATUTS[c.statut];
          const suite = SUITE[c.statut];
          const lignes = c.commande_lignes || [];
          return (
            <li key={c.id} className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">
                    Commande n°{c.numero} · {formaterDate(c.created_at)}
                  </p>
                  <p className="truncate text-lg font-bold">{c.client_nom}</p>
                </div>
                <div className="shrink-0 text-right">
                  <span className={"rounded-full px-2.5 py-1 text-xs font-semibold " + st.style}>{st.nom}</span>
                  <p className="mt-2 font-extrabold">{fcfa(c.total)}</p>
                </div>
              </div>

              <ul className="mt-3 space-y-1.5 rounded-2xl bg-slate-50 p-3 text-sm">
                {lignes.map((l) => (
                  <li key={l.id} className="flex justify-between gap-3">
                    <span className="min-w-0">
                      {l.quantite} × {l.produit_nom}
                      {detail(l) ? " (" + detail(l) + ")" : ""}
                    </span>
                    <span className="shrink-0 font-semibold">{fcfa(l.quantite * l.prix_unitaire)}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-3 space-y-1 text-sm">
                <p>
                  <span className="text-slate-500">Téléphone : </span>
                  <a href={"tel:+" + c.client_telephone} className="font-semibold text-emerald-700">
                    +{c.client_telephone}
                  </a>
                </p>
                <p>
                  <span className="text-slate-500">Adresse : </span>
                  {c.client_adresse}
                  {c.client_ville ? ", " + c.client_ville : ""}
                </p>
                {c.note && (
                  <p>
                    <span className="text-slate-500">Précision : </span>
                    {c.note}
                  </p>
                )}
                <p>
                  <span className="text-slate-500">Paiement : </span>à la livraison
                </p>
              </div>

              <a
                href={"https://wa.me/" + c.client_telephone + "?text=" + encodeURIComponent(messageClient(c, boutique))}
                className="mt-3 flex items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 active:bg-emerald-100"
              >
                Écrire au client sur WhatsApp
              </a>

              {c.statut === "nouvelle" && (
                <p className="mt-3 text-xs text-amber-700">
                  Les articles sont réservés pour ce client. Le stock baissera quand tu confirmeras la commande.
                </p>
              )}
              {["confirmee", "preparation", "livraison"].includes(c.statut) && (
                <p className="mt-3 text-xs text-slate-500">
                  Stock déjà retiré à la confirmation. À la livraison, la vente est ajoutée à ton tableau de bord.
                </p>
              )}

              {suite && (
                <form action={changerStatut} className="mt-3">
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="statut" value={suite.statut} />
                  <input type="hidden" name="vue" value={vue.cle} />
                  <BoutonEnvoi>{suite.libelle}</BoutonEnvoi>
                </form>
              )}

              {suite && (
                <Deplier titre="Annuler cette commande" ton="danger">
                  <form action={changerStatut} className="mt-3 space-y-3">
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="statut" value="annulee" />
                    <input type="hidden" name="vue" value={vue.cle} />
                    <p className="text-sm text-slate-600">
                      Le client n’est pas prévenu automatiquement : écris-lui sur WhatsApp. Les articles réservés ou
                      retirés du stock sont remis en vente.
                    </p>
                    <BoutonEnvoi ton="rouge">Oui, annuler la commande</BoutonEnvoi>
                  </form>
                </Deplier>
              )}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
