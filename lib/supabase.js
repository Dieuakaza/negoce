import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Crée la connexion à la base, au nom de la personne connectée
async function creerClient() {
  const url = process.env.SUPABASE_URL;
  const cle = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !cle) {
    throw new Error(
      "Les variables SUPABASE_URL et SUPABASE_PUBLISHABLE_KEY sont absentes dans Vercel."
    );
  }
  const magasin = await cookies();
  return createServerClient(url, cle, {
    cookies: {
      getAll() {
        return magasin.getAll();
      },
      setAll(liste) {
        try {
          liste.forEach(({ name, value, options }) => magasin.set(name, value, options));
        } catch {
          // Dans une page, on ne peut pas écrire de cookies : le proxy s’en charge
        }
      },
    },
  });
}

// Permet d’écrire getSupabase().from(...) sans « await » devant :
// la vraie connexion n’est créée qu’au moment où la requête est attendue.
function differer(etapes = []) {
  return new Proxy(() => {}, {
    get(_, nom) {
      if (nom === "then") {
        return (resolve, reject) =>
          creerClient()
            .then((client) => {
              let parent = null;
              let courant = client;
              for (const etape of etapes) {
                if (etape.type === "get") {
                  parent = courant;
                  courant = courant[etape.nom];
                } else {
                  courant = courant.apply(parent, etape.args);
                }
              }
              return courant;
            })
            .then(resolve, reject);
      }
      return differer([...etapes, { type: "get", nom }]);
    },
    apply(_, __, args) {
      return differer([...etapes, { type: "call", args }]);
    },
  });
}

export function getSupabase() {
  return differer();
}
