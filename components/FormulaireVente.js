"use client";

import { useState } from "react";
import BoutonEnvoi from "./BoutonEnvoi";
import { styleChamp } from "./ui";
import { fcfa } from "../lib/format";

// Prix proposé par défaut : le prix promo s’il y en a un, sinon le prix de vente
function prixCatalogue(p) {
  return Number(p.prix_promo !== null && p.prix_promo !== undefined ? p.prix_promo : p.prix_vente);
}

export default function FormulaireVente({ produits, action }) {
  const [produitId, setProduitId] = useState(produits[0]?.id || "");
  const [quantite, setQuantite] = useState(1);
  const [prixSaisi, setPrixSaisi] = useState(null); // null = prix du catalogue

  const produit = produits.find((p) => p.id === produitId);
  const catalogue = produit ? prixCatalogue(produit) : 0;
  const prix = prixSaisi === null ? catalogue : Math.max(0, Math.round(Number(prixSaisi) || 0));
  const qte = Math.max(0, Math.round(Number(quantite) || 0));
  const total = qte * prix;
  const gain = produit ? qte * (prix - Number(produit.prix_achat)) : 0;
  const perte = produit ? prix < Number(produit.prix_achat) : false;
  const tropGrand = produit ? qte > produit.stock : false;
  const invalide = !produit || qte < 1 || tropGrand || prix < 1;
  const difference = prix !== catalogue;
  const remise = catalogue > 0 && prix < catalogue ? Math.round((1 - prix / catalogue) * 100) : 0;

  const boutonQte =
    "flex w-14 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-2xl font-semibold text-slate-700 active:bg-slate-200";
  const petitBouton =
    "rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 active:bg-slate-200";

  function baisser(montant) {
    setPrixSaisi(String(Math.max(1, prix - montant)));
  }

  return (
    <form action={action} className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Produit vendu</span>
        <select
          name="produit_id"
          value={produitId}
          onChange={(e) => {
            setProduitId(e.target.value);
            setPrixSaisi(null);
          }}
          className={styleChamp}
        >
          {produits.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nom} ({p.stock} en stock)
            </option>
          ))}
        </select>
      </label>

      <div>
        <span className="text-sm font-medium text-slate-700">Quantité vendue</span>
        <div className="mt-1.5 flex items-stretch gap-2">
          <button
            type="button"
            aria-label="Moins"
            onClick={() => setQuantite(Math.max(1, qte - 1))}
            className={boutonQte}
          >
            −
          </button>
          <input
            name="quantite"
            type="number"
            min={1}
            step={1}
            inputMode="numeric"
            value={quantite}
            onChange={(e) => setQuantite(e.target.value)}
            className="w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-lg font-semibold outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
          />
          <button
            type="button"
            aria-label="Plus"
            onClick={() => setQuantite(qte + 1)}
            className={boutonQte}
          >
            +
          </button>
        </div>
      </div>

      <div>
        <span className="text-sm font-medium text-slate-700">Prix de vente (FCFA, par pièce)</span>
        <input
          name="prix"
          type="number"
          min={1}
          step={1}
          inputMode="numeric"
          value={prixSaisi === null ? String(catalogue) : prixSaisi}
          onChange={(e) => setPrixSaisi(e.target.value)}
          className={styleChamp}
        />
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button type="button" className={petitBouton} onClick={() => baisser(500)}>
            − 500
          </button>
          <button type="button" className={petitBouton} onClick={() => baisser(1000)}>
            − 1 000
          </button>
          {difference && (
            <button type="button" className={petitBouton} onClick={() => setPrixSaisi(null)}>
              Prix du catalogue
            </button>
          )}
        </div>
        {difference && (
          <p className="mt-2 text-xs text-slate-500">
            Prix du catalogue : {fcfa(catalogue)}
            {remise > 0 ? " · remise de " + remise + " %" : ""}
          </p>
        )}
        {perte && (
          <p className="mt-2 text-xs font-semibold text-red-600">
            Attention : tu vends à perte (prix d’achat : {fcfa(produit.prix_achat)}).
          </p>
        )}
      </div>

      <div className="rounded-2xl bg-emerald-50 p-4">
        <p className="text-xs text-emerald-800">Total à encaisser</p>
        <p className="mt-0.5 text-2xl font-bold text-emerald-900">{fcfa(total)}</p>
        <p className={"mt-1 text-sm font-semibold " + (gain >= 0 ? "text-emerald-700" : "text-red-600")}>
          Gain : {gain >= 0 ? "+" : ""}
          {fcfa(gain)}
        </p>
      </div>

      {tropGrand && (
        <p className="text-sm font-semibold text-red-600">
          Stock insuffisant : il n’en reste que {produit.stock}.
        </p>
      )}

      <BoutonEnvoi desactive={invalide}>Enregistrer la vente</BoutonEnvoi>
    </form>
  );
}
