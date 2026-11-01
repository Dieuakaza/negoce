import Link from "next/link";

export default function Accueil() {
  return (
    <main className="p-5">
      <div className="rounded-3xl bg-emerald-600 p-6 text-white shadow-lg">
        <p className="text-sm opacity-90">Bienvenue sur</p>
        <h1 className="mt-1 text-3xl font-bold">Negoce</h1>
        <p className="mt-3 text-sm opacity-90">
          Gérez votre commerce simplement depuis votre téléphone.
        </p>
      </div>
      <Link
        href="/produits"
        className="mt-6 flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm"
      >
        <span className="text-base font-semibold">📦 Mes produits</span>
        <span className="text-emerald-600">Ouvrir →</span>
      </Link>
    </main>
  );
}
