import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

// Vérifie, à chaque visite, que la personne est connectée
export async function updateSession(request) {
  let reponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(liste) {
          liste.forEach(({ name, value }) => request.cookies.set(name, value));
          reponse = NextResponse.next({ request });
          liste.forEach(({ name, value, options }) =>
            reponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Ne rien écrire entre la création du client et cette ligne
  const { data } = await supabase.auth.getClaims();
  const connecte = Boolean(data?.claims);

  const chemin = request.nextUrl.pathname;
  // Pages ouvertes à tout le monde : connexion, boutiques publiques, pages légales, liens reçus par e-mail
  const pagePublique =
    chemin.startsWith("/connexion") ||
    chemin.startsWith("/auth/") ||
    chemin.startsWith("/b/") ||
    chemin === "/confidentialite" ||
    chemin === "/conditions";

  if (!connecte && !pagePublique) {
    const url = request.nextUrl.clone();
    url.pathname = "/connexion";
    url.search = "";
    return NextResponse.redirect(url);
  }
  // Une personne déjà connectée n’a pas besoin de la page de connexion
  if (connecte && chemin === "/connexion") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return reponse;
}
