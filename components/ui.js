import Icone from "./Icone";

export const styleChamp =
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100";

export function EnTete({ titre, sous, icone }) {
  return (
    <header className="flex items-center gap-3">
      {icone && (
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
          <Icone nom={icone} className="h-6 w-6" />
        </span>
      )}
      <div>
        <h1 className="text-2xl font-bold leading-tight">{titre}</h1>
        {sous && <p className="text-sm text-slate-500">{sous}</p>}
      </div>
    </header>
  );
}

export function Alerte({ type = "ok", children }) {
  const styles = {
    ok: "bg-emerald-50 text-emerald-800",
    erreur: "border border-red-200 bg-red-50 text-red-800",
  };
  return (
    <div className={"mt-4 flex items-start gap-3 rounded-2xl p-4 text-sm font-semibold " + styles[type]}>
      <Icone
        nom={type === "ok" ? "verifie" : "alerte"}
        className="mt-0.5 h-5 w-5 shrink-0"
        epaisseur={2.2}
      />
      <div className="min-w-0 break-words">{children}</div>
    </div>
  );
}

export function Champ({
  label,
  name,
  type = "number",
  defaultValue,
  placeholder,
  requis = true,
  aide,
}) {
  const estNombre = type === "number";
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        name={name}
        type={type}
        required={requis}
        min={estNombre ? 0 : undefined}
        step={estNombre ? 1 : undefined}
        inputMode={estNombre ? "numeric" : undefined}
        defaultValue={defaultValue ?? undefined}
        placeholder={placeholder}
        className={styleChamp}
      />
      {aide && <span className="mt-1 block text-xs text-slate-500">{aide}</span>}
    </label>
  );
}

export function Zone({ label, name, defaultValue, placeholder, lignes = 3, maxLength, aide }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <textarea
        name={name}
        rows={lignes}
        maxLength={maxLength}
        defaultValue={defaultValue ?? undefined}
        placeholder={placeholder}
        className={styleChamp}
      />
      {aide && <span className="mt-1 block text-xs text-slate-500">{aide}</span>}
    </label>
  );
}

export function EtatVide({ icone, titre, texte }) {
  return (
    <div className="mt-8 flex flex-col items-center rounded-3xl border border-dashed border-slate-300 bg-white/60 px-6 py-10 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <Icone nom={icone} className="h-7 w-7" />
      </span>
      <p className="mt-4 font-semibold">{titre}</p>
      <p className="mt-1 text-sm text-slate-500">{texte}</p>
    </div>
  );
}

// Bloc qui s’ouvre et se ferme, avec un bouton bien visible
export function Deplier({ titre, icone, ton = "neutre", ouvert = false, children }) {
  const tons = {
    principal: "bg-emerald-600 text-white shadow-sm",
    neutre: "bg-slate-100 text-slate-700",
    danger: "bg-red-50 text-red-600",
  };
  return (
    <details open={ouvert} className="group mt-3">
      <summary
        className={
          "flex cursor-pointer list-none items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold [&::-webkit-details-marker]:hidden " +
          tons[ton]
        }
      >
        <span className="flex items-center gap-2">
          {icone && <Icone nom={icone} />}
          {titre}
        </span>
        <Icone nom="chevron" className="h-4 w-4 transition group-open:rotate-180" />
      </summary>
      <div>{children}</div>
    </details>
  );
}
