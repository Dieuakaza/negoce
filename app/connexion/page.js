import Link from "next/link";
import { seConnecter, creerCompte } from "./actions";
import { Marque } from "../../components/Marque";
import BoutonEnvoi from "../../components/BoutonEnvoi";
import { Alerte, styleChamp } from "../../components/ui";

export const dynamic = "force-dynamic";

export default async function PageConnexion({ searchParams }) {
  const params = await searchParams;
  const inscription = params?.mode === "inscription";
  const onglet = (actif) =>
    "flex-1 rounded-full px-3 py-2.5 text-center text-sm font-semibold transition " +
    (actif ? "bg-slate-900 text-white" : "bg-white text-slate-700 shadow-sm ring-1 ring-slate-100");

  return (
    <main className="flex min-h-screen flex-col justify-center p-5">
      <div className="rounded-3xl bg-[linear-gradient(135deg,#10b981,#047857)] p-6 text-white shadow-lg">
        <Marque clair slogan />
        <p className="mt-5 text-sm leading-relaxed text-white/90">
          Ta boutique en ligne, tes commandes et ta gestion, au même endroit.
        </p>
      </div>

      <div className="mt-5 flex gap-2">
        <Link href="/connexion" className={onglet(!inscription)}>
          Se connecter
        </Link>
        <Link href="/connexion?mode=inscription" className={onglet(inscription)}>
          Créer un compte
        </Link>
      </div>

      {params?.info && <Alerte>{params.info}</Alerte>}
      {params?.erreur && <Alerte type="erreur">{params.erreur}</Alerte>}

      <form
        action={inscription ? creerCompte : seConnecter}
        className="mt-4 space-y-3 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100"
      >
        {inscription && (
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Nom de ta boutique (facultatif)</span>
            <input name="boutique" type="text" placeholder="Ex : Chez Awa" className={styleChamp} />
          </label>
        )}
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
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Mot de passe</span>
          <input
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete={inscription ? "new-password" : "current-password"}
            placeholder="Au moins 6 caractères"
            className={styleChamp}
          />
        </label>
        <BoutonEnvoi attente={inscription ? "Création…" : "Connexion…"}>
          {inscription ? "Créer mon compte" : "Me connecter"}
        </BoutonEnvoi>
      </form>
    </main>
  );
}
