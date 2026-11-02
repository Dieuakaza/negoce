"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const onglets = [
  {
    href: "/",
    nom: "Accueil",
    dessin: <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  },
  {
    href: "/produits",
    nom: "Produits",
    dessin: (
      <>
        <path d="M21 8 12 3 3 8v8l9 5 9-5z" />
        <path d="m3 8 9 5 9-5" />
        <path d="M12 13v8" />
      </>
    ),
  },
  {
    href: "/ventes",
    nom: "Ventes",
    dessin: (
      <>
        <path d="M6 8h12l1 12H5z" />
        <path d="M9 8a3 3 0 0 1 6 0" />
      </>
    ),
  },
  {
    href: "/depenses",
    nom: "Dépenses",
    dessin: (
      <>
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ),
  },
  {
    href: "/compte",
    nom: "Compte",
    dessin: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
      </>
    ),
  },
];

export default function NavBas() {
  const chemin = usePathname();
  if (chemin.startsWith("/connexion")) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white/95 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-lg">
        {onglets.map((o) => {
          const actif = o.href === "/" ? chemin === "/" : chemin.startsWith(o.href);
          return (
            <li key={o.href} className="flex-1">
              <Link
                href={o.href}
                className={
                  "flex flex-col items-center gap-1 pb-2 pt-2 text-xs font-semibold " +
                  (actif ? "text-emerald-700" : "text-slate-500")
                }
              >
                <span
                  className={
                    "flex h-8 w-14 items-center justify-center rounded-full " +
                    (actif ? "bg-emerald-100" : "")
                  }
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={actif ? 2.2 : 1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {o.dessin}
                  </svg>
                </span>
                {o.nom}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
