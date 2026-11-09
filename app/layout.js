import { Inter } from "next/font/google";
import "./globals.css";
import NavBas from "../components/NavBas";
import BarreMarque from "../components/BarreMarque";
import PiedLegal from "../components/PiedLegal";
import PanierFlottant from "../components/PanierFlottant";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata = {
  title: "NEGOCE — Vends mieux. Gère simplement.",
  description: "Ta boutique en ligne, tes commandes et ta gestion depuis ton téléphone.",
  applicationName: "NEGOCE",
  appleWebApp: { capable: true, title: "NEGOCE", statusBarStyle: "default" },
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
        <div className="mx-auto min-h-screen max-w-lg">
          <BarreMarque />
          {children}
          <PiedLegal />
        </div>
        <PanierFlottant />
        <NavBas />
      </body>
    </html>
  );
}
