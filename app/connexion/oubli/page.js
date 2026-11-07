import Link from "next/link";
import { demanderReinitialisation } from "../actions";
import { Marque } from "../../../components/Marque";
import BoutonEnvoi from "../../../components/BoutonEnvoi";
import { Alerte, styleChamp } from "../../../components/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mot de passe oublié — NEGOCE" };

export default async function PageOubli({ searchParams }) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen flex-col justify-center p-5">
      <Marque slogan />
      <h1 className="mt-8 text-2xl font-bold">Mot de passe oublié ?</h1>
      <p className="mt-2 text-sm text-slate-600">
        Indique l’adresse e-mail de ton compte. Nous t’enverrons un lien pour choisir un nouveau mot de passe.
      </p>

      {params?.envoye && (
        <Alerte>
          Si un compte existe avec cette adresse, un e-mail vient d’être envoyé. Vérifie aussi tes courriers
          indésirables, et ouvre le lien avec le même navigateur que celui-ci.
        </Alerte>
      )}
      {params?.lien && (
        <Alerte type="erreur">Ce lien est invalide ou a expiré. Fais une nouvelle demande ci-dessous.</Alerte>
      )}
      {params?.erreur && <Alerte type="erreur">{params.erreur}</Alerte>}

      <form
        action={demanderReinitialisation}
        className="mt-4 space-y-3 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100"
      >
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Adresse e-mail</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            placeholder="toi@exemple.com"
            className={styleChamp}
          />
        </label>
        <BoutonEnvoi attente="Envoi…">Envoyer le lien</BoutonEnvoi>
      </form>

      <Link href="/connexion" className="mt-6 text-center text-sm font-semibold text-emerald-700">
        ← Retour à la connexion
      </Link>
    </main>
  );
}
