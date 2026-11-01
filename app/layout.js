import "./globals.css";

export const metadata = {
  title: "Negoce — Gérez votre commerce simplement",
  description: "Produits, ventes, dépenses et bénéfices, depuis votre téléphone.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#059669",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className="bg-slate-50 text-slate-900 antialiased">
        <div className="mx-auto min-h-screen max-w-lg">{children}</div>
      </body>
    </html>
  );
}
