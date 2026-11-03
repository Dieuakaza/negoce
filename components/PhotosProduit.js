"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Icone from "./Icone";

const MAX_PHOTOS = 6;
const TAILLE_MAX = 1200; // en pixels
const POIDS_MAX = 700 * 1024; // en octets

function chargerImage(fichier) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(fichier);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image illisible"));
    };
    image.src = url;
  });
}

function versBlob(canvas, qualite) {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", qualite));
}

// Réduit la photo : 1200 pixels maximum, format JPEG léger
async function reduire(fichier) {
  const image = await chargerImage(fichier);
  const echelle = Math.min(1, TAILLE_MAX / Math.max(image.naturalWidth, image.naturalHeight));
  const largeur = Math.max(1, Math.round(image.naturalWidth * echelle));
  const hauteur = Math.max(1, Math.round(image.naturalHeight * echelle));

  const canvas = document.createElement("canvas");
  canvas.width = largeur;
  canvas.height = hauteur;
  const contexte = canvas.getContext("2d");
  contexte.fillStyle = "#ffffff";
  contexte.fillRect(0, 0, largeur, hauteur);
  contexte.drawImage(image, 0, 0, largeur, hauteur);

  let qualite = 0.8;
  let blob = await versBlob(canvas, qualite);
  while (blob && blob.size > POIDS_MAX && qualite > 0.4) {
    qualite -= 0.1;
    blob = await versBlob(canvas, qualite);
  }
  if (!blob || blob.size > POIDS_MAX) throw new Error("photo trop lourde");
  return new File([blob], "photo.jpg", { type: "image/jpeg" });
}

export default function PhotosProduit({ produitId, photos, ajouter, supprimer, principale }) {
  const routeur = useRouter();
  const champ = useRef(null);
  const [message, setMessage] = useState("");
  const [occupe, setOccupe] = useState(false);

  async function choisir(evenement) {
    const fichiers = Array.from(evenement.target.files || []);
    evenement.target.value = "";
    if (fichiers.length === 0) return;

    const place = MAX_PHOTOS - photos.length;
    if (place <= 0) {
      setMessage("Maximum " + MAX_PHOTOS + " photos par produit.");
      return;
    }

    const aEnvoyer = fichiers.slice(0, place);
    setOccupe(true);
    let echecs = 0;
    for (let i = 0; i < aEnvoyer.length; i++) {
      setMessage("Envoi de la photo " + (i + 1) + " sur " + aEnvoyer.length + "…");
      try {
        const reduite = await reduire(aEnvoyer[i]);
        const donnees = new FormData();
        donnees.append("produit_id", produitId);
        donnees.append("photo", reduite);
        const reponse = await ajouter(donnees);
        if (!reponse?.ok) {
          echecs++;
          setMessage(reponse?.message || "Envoi impossible.");
        }
      } catch (erreur) {
        echecs++;
        setMessage("Envoi impossible : " + erreur.message);
      }
    }
    setOccupe(false);
    if (echecs === 0) {
      setMessage(
        fichiers.length > place ? "Maximum atteint : certaines photos n’ont pas été ajoutées." : ""
      );
    }
    routeur.refresh();
  }

  async function retirer(id) {
    if (!window.confirm("Supprimer cette photo ?")) return;
    setOccupe(true);
    const reponse = await supprimer(id);
    setOccupe(false);
    setMessage(reponse?.ok ? "" : reponse?.message || "Suppression impossible.");
    routeur.refresh();
  }

  async function mettreEnPremier(id) {
    setOccupe(true);
    const reponse = await principale(id);
    setOccupe(false);
    setMessage(reponse?.ok ? "" : reponse?.message || "Action impossible.");
    routeur.refresh();
  }

  return (
    <div className="mt-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
      <div className="grid grid-cols-3 gap-2">
        {photos.map((photo, index) => (
          <div key={photo.id} className="relative aspect-square overflow-hidden rounded-xl bg-slate-100">
            <img src={photo.url} alt="" loading="lazy" className="h-full w-full object-cover" />
            {index === 0 && (
              <span className="absolute left-1.5 top-1.5 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                Principale
              </span>
            )}
            <button
              type="button"
              disabled={occupe}
              onClick={() => retirer(photo.id)}
              aria-label="Supprimer la photo"
              className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white disabled:opacity-50"
            >
              <Icone nom="corbeille" className="h-4 w-4" />
            </button>
            {index > 0 && (
              <button
                type="button"
                disabled={occupe}
                onClick={() => mettreEnPremier(photo.id)}
                className="absolute bottom-1.5 left-1.5 right-1.5 rounded-full bg-black/60 py-1 text-[10px] font-semibold text-white disabled:opacity-50"
              >
                Mettre en premier
              </button>
            )}
          </div>
        ))}
        {photos.length < MAX_PHOTOS && (
          <button
            type="button"
            disabled={occupe}
            onClick={() => champ.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50 text-xs font-semibold text-emerald-700 disabled:opacity-60"
          >
            <Icone nom="plus" className="h-6 w-6" />
            Ajouter
          </button>
        )}
      </div>

      <input ref={champ} type="file" accept="image/*" multiple className="sr-only" onChange={choisir} />

      {message && <p className="mt-3 text-xs font-semibold text-slate-600">{message}</p>}
      <p className="mt-3 text-xs text-slate-500">
        Jusqu’à {MAX_PHOTOS} photos. Elles sont réduites automatiquement pour charger vite en 4G.
      </p>
    </div>
  );
}
