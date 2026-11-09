"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { commanderPanier, rafraichirProduits } from "../app/b/actions";
import { ecrirePanier, lirePanier } from "../lib/panier";
import BoutonEnvoi from "./BoutonEnvoi";
import { styleChamp } from "./ui";
import { fcfa } from "../lib/format";

function detail(ligne) {
  return [ligne.taille && "taille " + ligne.taille, ligne.couleur && "couleur " + ligne.couleur]
    .filter(Boolean)
    .join(" · ");
}

export default function PanierClient({ slug, nomBoutique, whatsapp }) {
  const [etat, action] = useActionState(commanderPanier, null);
  const [lignes, setLignes] = useState([]);
  const [infos, setInfos] = useState({});
  const [pret, setPret] = useState(false);
  const [verifie, setVerifie] = useState(false);

  // Charge le panier, puis récupère les prix et le stock à jour
  useEffect(() => {
    const panier = lirePanier(slug);
    setLignes(panier);
    const ids = [...new Set(panier.map((l) => l.produit_id))];
    if (ids.length === 0) {
      setPret(true);
      return;
    }
    rafraichirProduits(slug, ids)
      .then((resultat) => {
        setInfos(resultat || {});
        setVerifie(true);
        setPret(true);
      })
      .catch(() => setPret(true));
  }, [slug]);

  function enregistrer(nouvelles) {
    setLignes(nouvelles);
    ecrirePanier(slug, nouvelles);
  }

  function changerQuantite(index, delta) {
    enregistrer(
      lignes.map((l, i) =>
        i === index ? { ...l, quantite: Math.max(1, l.quantite + delta) } : l
      )
    );
  }

  function retirer(index) {
    enregistrer(lignes.filter((_, i) => i !== index));
  }

  const totalParProduit = {};
  for (const l of lignes) {
    totalParProduit[l.produit_id] = (totalParProduit[l.produit_id] || 0) + l.quantite;
  }

  function probleme(l) {
    if (!verifie) return "";
    const info = infos[l.produit_id];
    if (!info) return "Ce produit n’est plus disponible. Retire-le du panier.";
    if (info.disponible <= 0) return "Ce produit est épuisé. Retire-le du panier.";
    if (totalParProduit[l.produit_id] > info.disponible) {
      return "Il n’en reste que " + info.disponible + ". Diminue la quantité.";
    }
    return "";
  }

  const prixDe = (l) => (infos[l.produit_id] ? infos[l.produit_id].prix : Number(l.prix) || 0);
  const total = lignes.reduce((somme, l) => somme + prixDe(l) * l.quantite, 0);
  const bloque = lignes.some((l) => probleme(l) !== "");

  function ouvrirWhatsapp() {
    const corps = lignes.map((l) => {
      const nom = infos[l.produit_id]?.nom || l.nom;
      const options = detail(l).replace(/ · /g, ", ");
      return "• " + l.quantite + " × " + nom + (options ? " (" + options + ")" : "") + " — " + fcfa(prixDe(l) * l.quantite);
    });
    const texte =
      "Bonjour " + nomBoutique + ", je souhaite commander :\n" + corps.join("\n") + "\nTotal : " + fcfa(total);
    window.open("https://wa.me/" + whatsapp + "?text=" + encodeURIComponent(texte), "_blank", "noopener");
  }

  const boutonQte =
    "flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-lg font-semibold text-slate-700 active:bg-slate-200 disabled:opacity-40";

  return (
    <main className="px-5 pb-10 pt-4">
      <Link href={"/b/" + slug} className="text-sm font-semibold text-emerald-700">
        ← {nomBoutique}
      </Link>
      <h1 className="mt-3 text-2xl font-bold">Mon panier</h1>

      {!pret && <p className="mt-6 text-sm text-slate-500">Chargement…</p>}

      {pret && lignes.length === 0 && (
        <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white/60 px-6 py-10 text-center">
          <p className="font-semibold">Ton panier est vide</p>
          <p className="mt-1 text-sm text-slate-500">Ajoute des produits depuis la boutique.</p>
          <Link
            href={"/b/" + slug}
            className="mt-5 inline-block rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white"
          >
            Voir les produits
          </Link>
        </div>
      )}

      {pret && lignes.length > 0 && (
        <>
          <ul className="mt-4 space-y-3">
            {lignes.map((l, index) => {
              const info = infos[l.produit_id];
              const souci = probleme(l);
              const peutAugmenter = info ? totalParProduit[l.produit_id] < info.disponible : true;
              return (
                <li
                  key={l.produit_id + "|" + (l.taille || "") + "|" + (l.couleur || "")}
                  className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-100"
                >
                  <div className="flex gap-3">
                    {info?.photo ? (
                      <img src={info.photo} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
                    ) : (
                      <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xl font-bold text-slate-300">
                        {(info?.nom || l.nom || "?").charAt(0).toUpperCase()}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{info?.nom || l.nom}</p>
                      {detail(l) && <p className="text-xs text-slate-500">{detail(l)}</p>}
                      <p className="mt-1 text-sm font-semibold">
                        {fcfa(prixDe(l))}
                        {info?.enPromo && (
                          <span className="ml-2 text-xs font-normal text-slate-400 line-through">
                            {fcfa(info.prixNormal)}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {souci && <p className="mt-2 text-xs font-semibold text-red-600">{souci}</p>}

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="Moins"
                        disabled={l.quantite <= 1}
                        onClick={() => changerQuantite(index, -1)}
                        className={boutonQte}
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-semibold">{l.quantite}</span>
                      <button
                        type="button"
                        aria-label="Plus"
                        disabled={!peutAugmenter}
                        onClick={() => changerQuantite(index, 1)}
                        className={boutonQte}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => retirer(index)}
                        className="ml-2 text-xs font-semibold text-red-600"
                      >
                        Retirer
                      </button>
                    </div>
                    <span className="font-bold">{fcfa(prixDe(l) * l.quantite)}</span>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 rounded-2xl bg-emerald-50 p-4">
            <p className="text-xs text-emerald-800">Total à payer à la livraison</p>
            <p className="mt-0.5 text-2xl font-bold text-emerald-900">{fcfa(total)}</p>
          </div>

          <form
            action={action}
            className="mt-4 space-y-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100"
          >
            <h2 className="text-lg font-bold">Tes informations</h2>
            <input type="hidden" name="slug" value={slug} />
            <input
              type="hidden"
              name="lignes"
              value={JSON.stringify(
                lignes.map((l) => ({
                  produit_id: l.produit_id,
                  quantite: l.quantite,
                  taille: l.taille || "",
                  couleur: l.couleur || "",
                }))
              )}
            />

            {/* Piège pour les robots : invisible pour les vraies personnes */}
            <div className="absolute -left-[9999px]" aria-hidden="true">
              <label>
                Site web
                <input type="text" name="site_web" tabIndex={-1} autoComplete="off" />
              </label>
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

            {bloque && (
              <p className="text-sm font-semibold text-amber-700">
                Corrige les articles signalés en rouge pour continuer.
              </p>
            )}
            {etat?.erreur && (
              <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{etat.erreur}</p>
            )}

            <BoutonEnvoi desactive={bloque} attente="Envoi de ta commande…">
              Envoyer ma commande
            </BoutonEnvoi>

            <p className="text-xs leading-relaxed text-slate-500">
              En envoyant ta commande, tu acceptes que ton nom, ton numéro et ton adresse soient transmis à la
              boutique pour traiter ta commande. Le vendeur te contactera pour la confirmer. Voir la{" "}
              <Link href="/confidentialite" className="underline">
                politique de confidentialité
              </Link>{" "}
              et les{" "}
              <Link href="/conditions" className="underline">
                conditions d’utilisation
              </Link>
              .
            </p>
          </form>

          {whatsapp && (
            <button
              type="button"
              disabled={bloque}
              onClick={ouvrirWhatsapp}
              className="mt-4 w-full rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 active:bg-emerald-100 disabled:opacity-50"
            >
              Je préfère commander directement sur WhatsApp
            </button>
          )}
        </>
      )}
    </main>
  );
}
