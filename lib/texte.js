// « Chez Awa ! » devient « chez-awa »
export function versLien(texte) {
  return String(texte || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
}

// « 07 00 00 00 00 » devient « 2250700000000 » (format attendu par WhatsApp)
export function versNumeroWhatsapp(texte) {
  let numero = String(texte || "").replace(/\D/g, "");
  if (numero.startsWith("00")) numero = numero.slice(2);
  if (/^0\d{9}$/.test(numero)) numero = "225" + numero;
  return numero;
}
