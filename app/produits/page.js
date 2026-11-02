import { getSupabase } from "../../lib/supabase";
import { fcfa } from "../../lib/format";
import { ajouterProduit, modifierProduit, supprimerProduit } from "./actions";
import { EnTete, Alerte, Champ, Deplier, EtatVide } from "../../components/ui";
import BoutonEnvoi from "../../components/BoutonEnvoi";

export const dynamic = "force-dynamic";

async function chargerProduits() {
  try {
    const { data, error } = await getSupabase()
      .from("produits")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) return { produits: [], erreur: error.message };
    return { produits: data, erreur: null };
  } catch (e) {
    return { produits: [], erreur: e.message };
  }
}

function Formulaire({ action, produit, bouton }) {
  return (
    <form
      action={action}
      className="mt-3 space-y-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100"
    >
      {produit && <input type="hidden" name="id" value={produit.id} />}
      <Champ label="Nom du produit" name="nom" type="text" defaultValue={produit?.nom} placeholder="Ex : Robe en pagne" />
      <Champ label="Prix d’achat (FCFA)" name="prix_achat" defaultValue={produit?.prix_achat} placeholder="Ex : 5000" />
      <Champ label="Prix de vente (FCFA)" name="prix_vente" defaultValue={produit?.prix_vente} placeholder="Ex : 8000" />
      <Champ label="Quantité en stock" name="stock" defaultValue={produit?.stock} placeholder="Ex : 10" />
      <BoutonEnvoi>{bouton}</BoutonEnvoi>
    </form>
  );
}

export default async function PageProduits() {
  const { produits, erreur } = await chargerProduits();
  const n = produits.length;

  return (
    <main className="p-5 pb-28">
      <EnTete titre="Produits" icone="boite" sous={n + " produit" + (n > 1 ? "s" : "")} />

      {erreur && (
        <Alerte type="erreur">
          <p>Connexion à la base de données impossible</p>
          <p className="mt-1 font-normal">{erreur}</p>
        </Alerte>
      )}

      <div className="mt-5">
        <Deplier titre="Ajouter un produit" icone="plus" ton="principal" ouvert={n === 0 && !erreur}>
          <Formulaire action={ajouterProduit} bouton="Enregistrer le produit" />
        </Deplier>
      </div>

      {!erreur && n === 0 && (
        <EtatVide
          icone="boite"
          titre="Aucun produit pour l’instant"
          texte="Ajoutez votre premier produit avec le bouton vert ci-dessus."
        />
      )}

      <ul className="mt-5 space-y-3">
        {produits.map((p) => {
          const gain = Number(p.prix_vente) - Number(p.prix_achat);
          const etat =
            p.stock === 0
              ? "bg-red-100 text-red-700"
              : p.stock <= 3
              ? "bg-amber-100 text-amber-700"
              : "bg-emerald-100 text-emerald-700";
          return (
            <li key={p.id} className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-lg font-bold text-emerald-700">
                  {p.nom.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-base font-semibold">{p.nom}</h2>
                  <span
                    className={
                      "mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold " + etat
                    }
                  >
                    {p.stock === 0 ? "Épuisé" : p.stock + " en stock"}
                  </span>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs text-slate-500">Prix de vente</p>
                  <p className="font-bold">{fcfa(p.prix_vente)}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Prix d’achat</p>
                  <p className="font-semibold">{fcfa(p.prix_achat)}</p>
                </div>
                <div className={"rounded-xl p-3 " + (gain >= 0 ? "bg-emerald-50" : "bg-red-50")}>
                  <p className="text-xs text-slate-500">Gain par pièce</p>
                  <p className={"font-semibold " + (gain >= 0 ? "text-emerald-700" : "text-red-600")}>
                    {fcfa(gain)}
                  </p>
                </div>
              </div>

              <Deplier titre="Modifier" icone="crayon">
                <Formulaire action={modifierProduit} produit={p} bouton="Enregistrer les changements" />
              </Deplier>

              <Deplier titre="Supprimer" icone="corbeille" ton="danger">
                <form action={supprimerProduit} className="mt-3 space-y-3">
                  <input type="hidden" name="id" value={p.id} />
                  <p className="text-sm text-slate-600">
                    Cette action est définitive. Voulez-vous vraiment supprimer « {p.nom} » ?
                  </p>
                  <BoutonEnvoi ton="rouge">Oui, supprimer</BoutonEnvoi>
                </form>
              </Deplier>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
