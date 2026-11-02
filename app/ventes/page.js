import Link from "next/link";
import { getSupabase } from "../../lib/supabase";
import { fcfa } from "../../lib/format";
import { enregistrerVente } from "./actions";
import FormulaireVente from "../../components/FormulaireVente";
import Icone from "../../components/Icone";
import { EnTete, Alerte, EtatVide } from "../../components/ui";

export const dynamic = "force-dynamic";

async function charger() {
  try {
    const supabase = getSupabase();
    const [produits, ventes] = await Promise.all([
      supabase
        .from("produits")
        .select("id, nom, prix_vente, prix_achat, stock")
        .gt("stock", 0)
        .order("nom"),
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
    <main className="p-5 pb-28">
      <EnTete titre="Ventes" icone="sac" sous="Enregistrez une vente en quelques secondes" />

      {params?.ok && <Alerte>Vente enregistrée. Le stock a été mis à jour.</Alerte>}
      {params?.erreur && <Alerte type="erreur">{params.erreur}</Alerte>}
      {erreur && (
        <Alerte type="erreur">
          <p>Connexion à la base de données impossible</p>
          <p className="mt-1 font-normal">{erreur}</p>
        </Alerte>
      )}

      <section className="mt-5 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <h2 className="mb-4 text-base font-semibold">Nouvelle vente</h2>
        {produits.length === 0 ? (
          <p className="text-sm text-slate-500">
            Aucun produit en stock.{" "}
            <Link href="/produits" className="font-semibold text-emerald-700">
              Ajoutez d’abord un produit
            </Link>
            .
          </p>
        ) : (
          <FormulaireVente
            key={produits.map((p) => p.id + ":" + p.stock).join("|")}
            produits={produits}
            action={enregistrerVente}
          />
        )}
      </section>

      <h2 className="mt-8 text-lg font-semibold">Dernières ventes</h2>
      {ventes.length === 0 ? (
        <EtatVide
          icone="sac"
          titre="Aucune vente pour l’instant"
          texte="Vos ventes apparaîtront ici dès la première."
        />
      ) : (
        <ul className="mt-3 space-y-3">
          {ventes.map((v) => {
            const total = v.quantite * Number(v.prix_vente_unitaire);
            const gain = v.quantite * (Number(v.prix_vente_unitaire) - Number(v.prix_achat_unitaire));
            return (
              <li
                key={v.id}
                className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                  <Icone nom="sac" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{v.produit_nom}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {v.quantite} × {fcfa(v.prix_vente_unitaire)} · {formaterDate(v.date_vente)}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-bold">{fcfa(total)}</p>
                  <p
                    className={
                      "mt-0.5 text-xs font-semibold " +
                      (gain >= 0 ? "text-emerald-700" : "text-red-600")
                    }
                  >
                    {gain >= 0 ? "+" : ""}
                    {fcfa(gain)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
