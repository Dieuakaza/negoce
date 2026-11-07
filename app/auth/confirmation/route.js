import { NextResponse } from "next/server";
import { getSupabase } from "../../../lib/supabase";

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");

  let erreur = null;
  if (code) {
    const { error } = await getSupabase().auth.exchangeCodeForSession(code);
    erreur = error;
  } else if (tokenHash) {
    const { error } = await getSupabase().auth.verifyOtp({ type: "recovery", token_hash: tokenHash });
    erreur = error;
  } else {
    erreur = new Error("lien incomplet");
  }

  const destination = erreur ? "/connexion/oubli?lien=invalide" : "/connexion/nouveau";
  return NextResponse.redirect(new URL(destination, url.origin));
}
