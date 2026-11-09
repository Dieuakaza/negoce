"use client";

import { useEffect } from "react";
import { viderPanier } from "../lib/panier";

// Vide le panier une fois la commande envoyée
export default function ViderPanier({ slug }) {
  useEffect(() => {
    viderPanier(slug);
  }, [slug]);
  return null;
}
