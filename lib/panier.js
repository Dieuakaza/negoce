const MAX_LIGNES = 12;

function cle(slug) {
  return "negoce_panier_" + slug;
}

export function lirePanier(slug) {
  try {
    const liste = JSON.parse(window.localStorage.getItem(cle(slug)) || "[]");
    return Array.isArray(liste) ? liste : [];
  } catch {
    return [];
  }
}

export function ecrirePanier(slug, lignes) {
  try {
    window.localStorage.setItem(cle(slug), JSON.stringify(lignes));
  } catch {
    // stockage indisponible : rien à faire
  }
  window.dispatchEvent(new Event("panier-modifie"));
}

export function viderPanier(slug) {
  try {
    window.localStorage.removeItem(cle(slug));
  } catch {
    // stockage indisponible : rien à faire
  }
  window.dispatchEvent(new Event("panier-modifie"));
}

export function compterPanier(slug) {
  return lirePanier(slug).reduce((somme, l) => somme + (Number(l.quantite) || 0), 0);
}

// Ajoute un article ; regroupe les lignes identiques (même produit, taille et couleur)
export function ajouterAuPanier(slug, ligne) {
  const panier = lirePanier(slug);
  const existante = panier.find(
    (l) =>
      l.produit_id === ligne.produit_id &&
      (l.taille || "") === (ligne.taille || "") &&
      (l.couleur || "") === (ligne.couleur || "")
  );
  if (existante) {
    existante.quantite += ligne.quantite;
  } else {
    if (panier.length >= MAX_LIGNES) {
      return {
        ok: false,
        message: "Ton panier est plein (" + MAX_LIGNES + " articles différents au maximum).",
      };
    }
    panier.push(ligne);
  }
  ecrirePanier(slug, panier);
  return { ok: true };
}
