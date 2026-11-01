// Affiche un nombre en francs CFA : 15000 devient « 15 000 FCFA »
export function fcfa(montant) {
  const nombre = Math.round(Number(montant) || 0);
  return new Intl.NumberFormat("fr-FR").format(nombre) + " FCFA";
}
