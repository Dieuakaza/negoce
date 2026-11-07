"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PiedLegal() {
  const chemin = usePathname();
  const visible =
    chemin.startsWith("/b/") ||
    chemin.startsWith("/connexion") ||
    chemin === "/confidentialite" ||
    chemin === "/conditions";
  if (!visible) return null;

  // Sur la page d’un produit, on laisse la place à la barre « Commander »
  const avecBarre = chemin.includes("/p/");

  return (
    <footer
      className={"px-5 pt-2 text-center text-xs text-slate-400 " + (avecBarre ? "pb-28" : "pb-8")}
    >
      <Link href="/confidentialite" className="underline">
        Confidentialité
      </Link>
      <span className="mx-2">·</span>
      <Link href="/conditions" className="underline">
        Conditions d’utilisation
      </Link>
    </footer>
  );
}
