"use client";

import { useFormStatus } from "react-dom";

const styles = {
  vert: "bg-emerald-600 text-white active:bg-emerald-700",
  rouge: "bg-red-600 text-white active:bg-red-700",
  contour: "border border-red-200 bg-white text-red-600 active:bg-red-50",
};

// Bouton qui se bloque pendant l’enregistrement (évite les doubles envois)
export default function BoutonEnvoi({ children, ton = "vert", attente = "Un instant…" }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={
        "w-full rounded-xl px-4 py-3 text-base font-semibold transition disabled:opacity-60 " +
        styles[ton]
      }
    >
      {pending ? attente : children}
    </button>
  );
}
