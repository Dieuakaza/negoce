"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const onglets = [
  { href: "/", nom: "Accueil", icone: "🏠" },
  { href: "/produits", nom: "Produits", icone: "📦" },
  { href: "/ventes", nom: "Ventes", icone: "🛒" },
  { href: "/depenses", nom: "Dépenses", icone: "💸" },
];

export default function NavBas() {
  const chemin = usePathname();
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
                  "flex flex-col items-center gap-0.5 py-2 text-xs font-semibold " +
                  (actif ? "text-emerald-700" : "text-slate-500")
                }
              >
                <span className="text-xl leading-none">{o.icone}</span>
                {o.nom}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
