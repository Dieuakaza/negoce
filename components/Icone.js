const dessins = {
  plus: <path d="M12 5v14M5 12h14" />,
  chevron: <path d="m6 9 6 6 6-6" />,
  verifie: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  alerte: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16.5h.01" />
    </>
  ),
  boite: (
    <>
      <path d="M21 8 12 3 3 8v8l9 5 9-5z" />
      <path d="m3 8 9 5 9-5" />
      <path d="M12 13v8" />
    </>
  ),
  sac: (
    <>
      <path d="M6 8h12l1 12H5z" />
      <path d="M9 8a3 3 0 0 1 6 0" />
    </>
  ),
  billet: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),
  utilisateur: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
    </>
  ),
  corbeille: (
    <>
      <path d="M4 7h16M10 11v6M14 11v6" />
      <path d="m6 7 1 13h10l1-13M9 7V4h6v3" />
    </>
  ),
  crayon: (
    <>
      <path d="M4 20h4L19 9l-4-4L4 16z" />
      <path d="m13.5 6.5 4 4" />
    </>
  ),
  graphique: <path d="M4 19V5M4 19h16M8 15l4-4 3 3 5-6" />,
};

export default function Icone({ nom, className = "h-5 w-5", epaisseur = 1.8 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={epaisseur}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {dessins[nom]}
    </svg>
  );
}
