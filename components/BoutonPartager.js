"use client";

import { useState } from "react";

export default function BoutonPartager({ titre, texte, url, className = "" }) {
  const [copie, setCopie] = useState(false);

  async function partager() {
    const lien = url || window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: titre, text: texte, url: lien });
        return;
      }
      await navigator.clipboard.writeText(lien);
      setCopie(true);
      setTimeout(() => setCopie(false), 2000);
    } catch {
      // partage annulé : rien à faire
    }
  }

  return (
    <button type="button" onClick={partager} className={className}>
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 3v12M8 7l4-4 4 4" />
        <path d="M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7" />
      </svg>
      {copie ? "Lien copié !" : "Partager"}
    </button>
  );
}
