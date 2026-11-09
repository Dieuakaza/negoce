"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ajouterAuPanier, lirePanier } from "../lib/panier";
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
  const routeur = useRouter();
  const [taille, setTaille] = useState(produit.tailles.length === 1 ? produit.tailles[0] : "");
  const [couleur, setCouleur] = useState(produit.couleurs.length === 1 ? produit.couleurs[0] : "");
  const [quantite, setQuantite] = useState(1);
  const [deja, setDeja] = useState(0);
  const [message, setMessage] = useState("");
  const [ajoute, setAjoute] = useState(false);

  // Combien de pièces de ce produit sont déjà dans le panier
  useEffect(() => {
    function maj() {
      const total = lirePanier(slug)
        .filter((l) => l.produit_id === produit.id)
        .reduce((somme, l) => somme + (Number(l.quantite) || 0), 0);
      setDeja(total);
    }
    maj();
    window.addEventListener("panier-modifie", maj);
    return () => window.removeEventListener("panier-modifie", maj);
  }, [slug, produit.id]);

  const maxi = Math.max(0, produit.disponible - deja);
  const qte = maxi > 0 ? Math.min(quantite, maxi) : 0;
  const total = produit.prix * qte;
  const aChoisir = [
    produit.tailles.length > 0 && !taille ? "une taille" : null,
    produit.couleurs.length > 0 && !couleur ? "une couleur" : null,
  ]
    .filter(Boolean)
    .join(" et ");
  const manque = aChoisir !== "";

  const boutonQte =
    "flex w-14 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-2xl font-semibold text-slate-700 active:bg-slate-200 disabled:opacity-40";

  function ajouter() {
    if (manque) {
      setMessage("Choisis d’abord " + aChoisir + ".");
      return false;
    }
    if (qte < 1) {
      setMessage("Tu as déjà ajouté tous les articles disponibles.");
      return false;
    }
    const resultat = ajouterAuPanier(slug, {
      produit_id: produit.id,
      nom: produit.nom,
      prix: produit.prix,
      taille,
      couleur,
      quantite: qte,
    });
    if (!resultat.ok) {
      setMessage(resultat.message);
      return false;
    }
    setMessage("");
    return true;
  }

  function ajouterEtContinuer() {
    if (ajouter()) {
      setAjoute(true);
      setQuantite(1);
    }
  }

  function commanderMaintenant() {
    if (ajouter()) routeur.push("/b/" + slug + "/panier");
  }

  function ouvrirWhatsapp() {
    if (manque) {
      setMessage("Choisis d’abord " + aChoisir + ".");
      return;
    }
    setMessage("");
    const details = [taille && "taille " + taille, couleur && "couleur " + couleur].filter(Boolean);
    let texte =
      "Bonjour " + nomBoutique + ", je souhaite commander :\n• " + Math.max(qte, 1) + " × " + produit.nom;
    if (details.length > 0) texte += " (" + details.join(", ") + ")";
    texte += "\nTotal : " + fcfa(produit.prix * Math.max(qte, 1)) + "\n" + window.location.href;
    window.open("https://wa.me/" + whatsapp + "?text=" + encodeURIComponent(texte), "_blank", "noopener");
  }

  return (
    <section id="commander" className="scroll-mt-4 px-5 pt-8">
      <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <h2 className="text-lg font-bold">Commander</h2>

        <div className="mt-4 space-y-4">
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
                disabled={qte <= 1}
                onClick={() => setQuantite(Math.max(1, qte - 1))}
                className={boutonQte}
              >
                −
              </button>
              <div className="flex w-full items-center justify-center rounded-xl bg-slate-50 py-3 text-lg font-semibold">
                {qte}
              </div>
              <button
                type="button"
                aria-label="Plus"
                disabled={qte >= maxi}
                onClick={() => setQuantite(Math.min(maxi, qte + 1))}
                className={boutonQte}
              >
                +
              </button>
            </div>
            {deja > 0 && (
              <p className="mt-2 text-xs text-slate-500">
                Tu as déjà {deja} pièce{deja > 1 ? "s" : ""} dans ton panier.
              </p>
            )}
          </div>

          <div className="rounded-2xl bg-emerald-50 p-4">
            <p className="text-xs text-emerald-800">Total pour cet article</p>
            <p className="mt-0.5 text-2xl font-bold text-emerald-900">{fcfa(total)}</p>
          </div>

          {message && <p className="text-sm font-semibold text-amber-700">{message}</p>}

          {ajoute && (
            <div className="rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
              Ajouté au panier ✓{" "}
              <Link href={"/b/" + slug + "/panier"} className="underline">
                Voir mon panier
              </Link>
            </div>
          )}

          <div className="grid gap-2">
            <button
              type="button"
              disabled={maxi <= 0}
              onClick={ajouterEtContinuer}
              className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-base font-semibold text-white active:bg-emerald-700 disabled:opacity-50"
            >
              Ajouter au panier
            </button>
            <button
              type="button"
              disabled={maxi <= 0}
              onClick={commanderMaintenant}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 text-base font-semibold text-white active:bg-slate-700 disabled:opacity-50"
            >
              Commander maintenant
            </button>
          </div>
        </div>

        {whatsapp && (
          <button
            type="button"
            onClick={ouvrirWhatsapp}
            className="mt-4 w-full rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 active:bg-emerald-100"
          >
            Je préfère commander directement sur WhatsApp
          </button>
        )}
      </div>
    </section>
  );
}
