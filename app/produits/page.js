import Link from "next/link";
import { getSupabase } from "../../lib/supabase";
import { fcfa } from "../../lib/format";
import { ajouterProduit, modifierProduit, supprimerProduit } from "./actions";

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

function Champ({ label, name, type = "number", defaultValue, placeholder }) {
  const estNombre = type === "number";
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        name={name}
        type={type}
        required
        min={estNombre ? 0 : undefined}
        step={estNombre ? 1 : undefined}
        inputMode={estNombre ? "numeric" : undefined}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
      />
    </label>
  );
}

function Formulaire({ action, produit, bouton }) {
  return (
    <form action={action} className="mt-4 space-y-3">
      {produit && <input type="hidden" name="id" value={produit.id} />}
      <Champ label="Nom du produit" name="nom" type="text" defaultValue={produit?.nom} placeholder="Ex : Robe en pagne" />
      <Champ label="Prix d’achat (FCFA)" name="prix_achat" defaultValue={produit?.prix_achat} placeholder="Ex : 5000" />
      <Champ label="Prix de vente (FCFA)" name="prix_vente" defaultValue={produit?.prix_vente} placeholder="Ex : 8000" />
      <Champ label="Quantité en stock" name="stock" defaultValue={produit?.stock} placeholder="Ex : 10" />
      <button
        type="submit"
        className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-base font-semibold text-white active:bg-emerald-700"
      >
        {bouton}
      </button>
    </form>
  );
}

export default async function PageProduits() {
  const { produits, erreur } = await chargerProduits();

  return (
    <main className="p-5 pb-24">
      <Link href="/" className="text-sm text-emerald-700">← Accueil</Link>
      <h1 className="mt-2 text-2xl font-bold">Mes produits</h1>
      <p className="mt-1 text-sm text-slate-500">
        {produits.length} produit{produits.length > 1 ? "s" : ""}
      </p>

      {erreur && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <p className="font-semibold">Connexion à la base de données impossible</p>
          <p className="mt-1 break-words">{erreur}</p>
        </div>
      )}

      <details
        open={produits.length === 0 && !erreur}
        className="mt-5 rounded-2xl bg-white p-4 shadow-sm"
      >
        <summary className="cursor-pointer text-base font-semibold text-emerald-700">
          + Ajouter un produit
        </summary>
        <Formulaire action={ajouterProduit} bouton="Enregistrer le produit" />
      </details>

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
            <li key={p.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-base font-semibold">{p.nom}</h2>
                <span className={"shrink-0 rounded-full px-3 py-1 text-xs font-semibold " + etat}>
                  {p.stock === 0 ? "Épuisé" : p.stock + " en stock"}
                </span>
              </div>

              <div className="mt-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Prix d’achat</span>
                  <span>{fcfa(p.prix_achat)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Prix de vente</span>
                  <span>{fcfa(p.prix_vente)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Gain par pièce</span>
                  <span className={gain >= 0 ? "font-semibold text-emerald-700" : "font-semibold text-red-600"}>
                    {fcfa(gain)}
                  </span>
                </div>
              </div>

              <details className="mt-3 border-t border-slate-100 pt-3">
                <summary className="cursor-pointer text-sm font-semibold text-slate-700">Modifier</summary>
                <Formulaire action={modifierProduit} produit={p} bouton="Enregistrer les changements" />
              </details>

              <details className="mt-2">
                <summary className="cursor-pointer text-sm font-semibold text-red-600">Supprimer</summary>
                <form action={supprimerProduit} className="mt-3 space-y-3">
                  <input type="hidden" name="id" value={p.id} />
                  <p className="text-sm text-slate-600">
                    Cette action est définitive. Voulez-vous vraiment supprimer « {p.nom} » ?
                  </p>
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-red-600 px-4 py-3 text-base font-semibold text-white active:bg-red-700"
                  >
                    Oui, supprimer
                  </button>
                </form>
              </details>
            </li>
          );
        })}
      </ul>

      {!erreur && produits.length === 0 && (
        <p className="mt-8 text-center text-sm text-slate-500">
          Aucun produit pour l’instant. Ajoutez le premier !
        </p>
      )}
    </main>
  );
}
