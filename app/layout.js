import { Inter } from "next/font/google";
import "./globals.css";
import NavBas from "../components/NavBas";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata = {
  title: "Negoce — Gérez votre commerce simplement",
  description: "Produits, ventes, dépenses et bénéfices, depuis votre téléphone.",
  applicationName: "Negoce",
  appleWebApp: { capable: true, title: "Negoce", statusBarStyle: "default" },
  formatDetection: { telephone: false },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#059669",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body
        className={inter.className + " bg-slate-50 text-slate-900 antialiased tabular-nums"}
      >
        <div className="mx-auto min-h-screen max-w-lg">{children}</div>
        <NavBas />
      </body>
    </html>
  );
}
