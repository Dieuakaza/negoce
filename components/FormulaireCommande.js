"use client";

import { useActionState, useState } from "react";
import { commander } from "../app/b/actions";
import BoutonEnvoi from "./BoutonEnvoi";
import { styleChamp } from "./ui";
import { fcfa } from "../lib/format";

function Choix({ titre, options, valeur, onChoisir }) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-700">{titre}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            aria-pressed={valeur === o}
            onClick={() => onChoisir(o)}
            className={
              "rounded-xl px-4 py-2.5 text-sm font-semibold transition " +
              (valeur === o
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-700 active:bg-slate-200")
            }
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function FormulaireCommande({ slug, produit, whatsapp, nomBoutique }) {
  const [etat, action] = useActionState(commander, null);
  const [taille, setTaille] = useState(produit.tailles.length === 1 ? produit.tailles[0] : "");
  const [couleur, setCouleur] = useState(produit.couleurs.length === 1 ? produit.couleurs[0] : "");
  const [quantite, setQuantite] = useState(1);
  const [avertissement, setAvertissement] = useState("");

  const maxi = Math.max(1, produit.disponible);
  const total = produit.prix * quantite;
  const aChoisir = [
    produit.tailles.length > 0 && !taille ? "une taille" : null,
    produit.couleurs.length > 0 && !couleur ? "une couleur" : null,
  ]
    .filter(Boolean)
    .join(" et ");
  const manque = aChoisir !== "";

  const boutonQte =
    "flex w-14 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-2xl font-semibold text-slate-700 active:bg-slate-200 disabled:opacity-40";

  function ouvrirWhatsapp() {
    if (manque) {
      setAvertissement("Choisis d’abord " + aChoisir + ".");
      return;
    }
    setAvertissement("");
    const details = [taille && "taille " + taille, couleur && "couleur " + couleur].filter(Boolean);
    let texte =
      "Bonjour " + nomBoutique + ", je souhaite commander :\n• " + quantite + " × " + produit.nom;
    if (details.length > 0) texte += " (" + details.join(", ") + ")";
    texte += "\nTotal : " + fcfa(total) + "\n" + window.location.href;
    window.open("https://wa.me/" + whatsapp + "?text=" + encodeURIComponent(texte), "_blank", "noopener");
  }

  return (
    <section id="commander" className="scroll-mt-4 px-5 pt-8">
      <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <h2 className="text-lg font-bold">Commander</h2>

        <form action={action} className="mt-4 space-y-4">
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="produit_id" value={produit.id} />
          <input type="hidden" name="taille" value={taille} />
          <input type="hidden" name="couleur" value={couleur} />
          <input type="hidden" name="quantite" value={quantite} />

          {/* Piège pour les robots : invisible pour les vraies personnes */}
          <div className="absolute -left-[9999px]" aria-hidden="true">
            <label>
              Site web
              <input type="text" name="site_web" tabIndex={-1} autoComplete="off" />
            </label>
          </div>

          {produit.tailles.length > 0 && (
            <Choix titre="Taille" options={produit.tailles} valeur={taille} onChoisir={setTaille} />
          )}
          {produit.couleurs.length > 0 && (
            <Choix titre="Couleur" options={produit.couleurs} valeur={couleur} onChoisir={setCouleur} />
          )}

          <div>
            <p className="text-sm font-medium text-slate-700">Quantité</p>
            <div className="mt-2 flex items-stretch gap-2">
              <button
                type="button"
                aria-label="Moins"
                disabled={quantite <= 1}
                onClick={() => setQuantite(Math.max(1, quantite - 1))}
                className={boutonQte}
              >
                −
              </button>
              <div className="flex w-full items-center justify-center rounded-xl bg-slate-50 py-3 text-lg font-semibold">
                {quantite}
              </div>
              <button
                type="button"
                aria-label="Plus"
                disabled={quantite >= maxi}
                onClick={() => setQuantite(Math.min(maxi, quantite + 1))}
                className={boutonQte}
              >
                +
              </button>
            </div>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Ton nom</span>
            <input name="nom" type="text" required autoComplete="name" placeholder="Ex : Awa Koné" className={styleChamp} />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Ton numéro (WhatsApp de préférence)</span>
            <input
              name="telephone"
              type="tel"
              required
              inputMode="tel"
              autoComplete="tel"
              placeholder="Ex : 0700000000"
              className={styleChamp}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Adresse de livraison ou quartier</span>
            <input
              name="adresse"
              type="text"
              required
              autoComplete="street-address"
              placeholder="Ex : Cocody, Riviera 3, près de la pharmacie"
              className={styleChamp}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Ville</span>
            <input name="ville" type="text" autoComplete="address-level2" placeholder="Ex : Abidjan" className={styleChamp} />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Précision (facultatif)</span>
            <textarea name="note" rows={2} maxLength={300} placeholder="Heure de livraison, point de repère…" className={styleChamp} />
          </label>

          <div className="rounded-2xl bg-emerald-50 p-4">
            <p className="text-xs text-emerald-800">Total à payer à la livraison</p>
            <p className="mt-0.5 text-2xl font-bold text-emerald-900">{fcfa(total)}</p>
          </div>

          {manque && (
            <p className="text-sm font-semibold text-amber-700">Choisis {aChoisir} pour continuer.</p>
          )}
          {etat?.erreur && (
            <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{etat.erreur}</p>
          )}

          <BoutonEnvoi desactive={manque} attente="Envoi de ta commande…">
            Envoyer ma commande
          </BoutonEnvoi>

          <p className="text-xs text-slate-500">
            Tes informations servent uniquement à traiter ta commande. Le vendeur te contactera pour la confirmer.
          </p>
        </form>

        {whatsapp && (
          <>
            <button
              type="button"
              onClick={ouvrirWhatsapp}
              className="mt-4 w-full rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 active:bg-emerald-100"
            >
              Je préfère commander directement sur WhatsApp
            </button>
            {avertissement && (
              <p className="mt-2 text-sm font-semibold text-amber-700">{avertissement}</p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
