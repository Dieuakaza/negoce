"use client";

export default function BoutonWhatsapp({ numero, message, children, className = "" }) {
  const base = "https://wa.me/" + numero + "?text=";

  function ouvrir(evenement) {
    evenement.preventDefault();
    const texte = message + "\n" + window.location.href;
    window.open(base + encodeURIComponent(texte), "_blank", "noopener");
  }

  return (
    <a href={base + encodeURIComponent(message)} onClick={ouvrir} className={className}>
      {children}
    </a>
  );
}
