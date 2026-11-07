"use client";

import { usePathname } from "next/navigation";
import { Marque } from "./Marque";

export default function BarreMarque() {
  const chemin = usePathname();
  const cachee =
    chemin.startsWith("/connexion") ||
    chemin.startsWith("/b/") ||
    chemin === "/confidentialite" ||
    chemin === "/conditions";
  if (cachee) return null;

  return (
    <div className="flex items-center px-5 pt-4">
      <Marque petit />
    </div>
  );
}
