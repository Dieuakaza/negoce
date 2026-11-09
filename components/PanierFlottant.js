"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { compterPanier } from "../lib/panier";

export default function PanierFlottant() {
  const chemin = usePathname();
  const correspondance = chemin.match(/^\/b\/([^/]+)/);
  const slug = correspondance ? correspondance[1] : null;
  const [nombre, setNombre] = useState(0);

  useEffect(() => {
    if (!slug) return;
    const maj = () => setNombre(compterPanier(slug));
    maj();
    window.addEventListener("panier-modifie", maj);
    window.addEventListener("storage", maj);
    return () => {
      window.removeEventListener("panier-modifie", maj);
      window.removeEventListener("storage", maj);
    };
  }, [slug, chemin]);

  if (!slug || nombre === 0) return null;
  if (chemin.endsWith("/panier") || chemin.endsWith("/merci")) return null;

  // Sur la page d’un produit, on se place au-dessus de la barre « Commander »
  const surProduit = chemin.includes("/p/");

  return (
    <div
      className={"pointer-events-none fixed inset-x-0 z-20 " + (surProduit ? "bottom-24" : "bottom-6")}
    >
      <div className="mx-auto flex max-w-lg justify-end px-5">
        <Link
          href={"/b/" + slug + "/panier"}
          className="pointer-events-auto flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-lg active:bg-slate-700"
        >
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
            <path d="M6 8h12l1 12H5z" />
            <path d="M9 8a3 3 0 0 1 6 0" />
          </svg>
          Mon panier ({nombre})
        </Link>
      </div>
    </div>
  );
}
