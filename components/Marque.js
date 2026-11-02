export function LogoN({ taille = 40, clair = false }) {
  return (
    <span
      className={
        "flex shrink-0 items-center justify-center rounded-xl " +
        (clair ? "bg-white" : "bg-[linear-gradient(135deg,#10b981,#047857)]")
      }
      style={{ width: taille, height: taille }}
    >
      <svg viewBox="0 0 100 100" width={taille * 0.72} height={taille * 0.72}>
        <path
          d="M26 78 V22 H38 L62 58 V22 H74 V78 H62 L38 42 V78 Z"
          fill={clair ? "#047857" : "white"}
        />
      </svg>
    </span>
  );
}

export function Marque({ slogan = false, clair = false, petit = false }) {
  return (
    <div className="flex items-center gap-3">
      <LogoN taille={petit ? 30 : 44} clair={clair} />
      <div>
        <p
          className={
            "font-extrabold tracking-[0.18em] " +
            (petit ? "text-sm " : "text-xl ") +
            (clair ? "text-white" : "text-slate-900")
          }
        >
          NEGOCE
        </p>
        {slogan && (
          <p className={"text-xs " + (clair ? "text-white/80" : "text-slate-500")}>
            Vends mieux. Gère simplement.
          </p>
        )}
      </div>
    </div>
  );
}
