import Link from "next/link";

export function PageTexte({ titre, misAJour, children }) {
  return (
    <main className="px-5 pb-10 pt-8">
      <Link href="/" className="text-sm font-semibold text-emerald-700">
        ← NEGOCE
      </Link>
      <h1 className="mt-4 text-2xl font-bold leading-tight">{titre}</h1>
      <p className="mt-1 text-xs text-slate-500">Dernière mise à jour : {misAJour}</p>
      <div className="mt-6 space-y-6">{children}</div>
    </main>
  );
}

export function Section({ titre, children }) {
  return (
    <section>
      <h2 className="text-base font-bold">{titre}</h2>
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-slate-700">{children}</div>
    </section>
  );
}

export function Liste({ elements }) {
  return (
    <ul className="list-disc space-y-1 pl-5">
      {elements.map((e) => (
        <li key={e}>{e}</li>
      ))}
    </ul>
  );
}
