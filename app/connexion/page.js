import Link from "next/link";
import { seConnecter, creerCompte } from "./actions";

export const dynamic = "force-dynamic";

const styleChamp =
  "mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200";

export default async function PageConnexion({ searchParams }) {
  const params = await searchParams;
  const inscription = params?.mode === "inscription";
  const onglet = (actif) =>
    "flex-1 rounded-full px-3 py-2 text-center text-sm font-semibold " +
    (actif ? "bg-slate-900 text-white" : "bg-white text-slate-700 shadow-sm");

  return (
    <main className="flex min-h-screen flex-col justify-center p-5">
      <div className="rounded-3xl bg-emerald-600 p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold">Negoce</h1>
        <p className="mt-2 text-sm opacity-90">
          Gérez votre commerce simplement depuis votre téléphone.
        </p>
      </div>

      <div className="mt-5 flex gap-2">
        <Link href="/connexion" className={onglet(!inscription)}>Se connecter</Link>
        <Link href="/connexion?mode=inscription" className={onglet(inscription)}>Créer un compte</Link>
      </div>

      {params?.info && (
        <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
          {params.info}
        </div>
      )}
      {params?.erreur && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">
          {params.erreur}
        </div>
      )}

      <form
        action={inscription ? creerCompte : seConnecter}
        className="mt-4 space-y-3 rounded-2xl bg-white p-4 shadow-sm"
      >
        {inscription && (
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Nom de votre boutique (facultatif)</span>
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
            placeholder="vous@exemple.com"
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
        <button
          type="submit"
          className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-base font-semibold text-white active:bg-emerald-700"
        >
          {inscription ? "Créer mon compte" : "Me connecter"}
        </button>
      </form>
    </main>
  );
}
