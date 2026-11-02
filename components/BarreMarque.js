"use client";

import { usePathname } from "next/navigation";
import { Marque } from "./Marque";

export default function BarreMarque() {
  const chemin = usePathname();
  if (chemin.startsWith("/connexion") || chemin.startsWith("/b/")) return null;

  return (
    <div className="flex items-center px-5 pt-4">
      <Marque petit />
    </div>
  );
}
