import Link from "next/link";

export default function Introuvable() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <p className="text-5xl font-extrabold text-slate-300">404</p>
      <h1 className="mt-4 text-xl font-bold">Boutique introuvable</h1>
      <p className="mt-2 text-sm text-slate-500">
        Ce lien n’existe pas, ou la boutique n’est pas encore publiée.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white"
      >
        Aller sur NEGOCE
      </Link>
    </main>
  );
}
