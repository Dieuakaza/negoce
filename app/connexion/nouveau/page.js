import Link from "next/link";
import { getSupabase } from "../../../lib/supabase";
import { changerMotDePasse } from "../actions";
import { Marque } from "../../../components/Marque";
import BoutonEnvoi from "../../../components/BoutonEnvoi";
import { Alerte, styleChamp } from "../../../components/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Nouveau mot de passe — NEGOCE" };

async function utilisateur() {
  try {
    const { data } = await getSupabase().auth.getUser();
    return data?.user || null;
  } catch {
    return null;
  }
}

export default async function PageNouveau({ searchParams }) {
  const params = await searchParams;
  const user = await utilisateur();

  return (
    <main className="flex min-h-screen flex-col justify-center p-5">
      <Marque slogan />
      <h1 className="mt-8 text-2xl font-bold">Nouveau mot de passe</h1>

      {params?.ok ? (
        <>
          <Alerte>Ton mot de passe a bien été modifié.</Alerte>
          <Link
            href="/"
            className="mt-4 block rounded-xl bg-emerald-600 px-4 py-3 text-center text-base font-semibold text-white active:bg-emerald-700"
          >
            Aller à mon tableau de bord
          </Link>
        </>
      ) : !user ? (
        <>
          <Alerte type="erreur">Ce lien est invalide ou a expiré. Fais une nouvelle demande.</Alerte>
          <Link
            href="/connexion/oubli"
            className="mt-4 block rounded-xl bg-emerald-600 px-4 py-3 text-center text-base font-semibold text-white active:bg-emerald-700"
          >
            Demander un nouveau lien
          </Link>
        </>
      ) : (
        <>
          <p className="mt-2 text-sm text-slate-600">Choisis un mot de passe que tu retiendras facilement.</p>
          {params?.erreur && <Alerte type="erreur">{params.erreur}</Alerte>}
          <form
            action={changerMotDePasse}
            className="mt-4 space-y-3 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100"
          >
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Nouveau mot de passe</span>
              <input
                name="password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="Au moins 6 caractères"
                className={styleChamp}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Répète le mot de passe</span>
              <input
                name="confirmation"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                className={styleChamp}
              />
            </label>
            <BoutonEnvoi attente="Enregistrement…">Enregistrer le mot de passe</BoutonEnvoi>
          </form>
        </>
      )}
    </main>
  );
}
