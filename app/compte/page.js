import { getSupabase } from "../../lib/supabase";
import { seDeconnecter } from "../connexion/actions";
import BoutonEnvoi from "../../components/BoutonEnvoi";
import { EnTete } from "../../components/ui";

export const dynamic = "force-dynamic";

async function charger() {
  try {
    const supabase = getSupabase();
    const { data: compte } = await supabase.auth.getUser();
    const { data: boutiques } = await supabase.from("boutiques").select("nom").limit(1);
    return { email: compte?.user?.email || "", boutique: boutiques?.[0]?.nom || "" };
  } catch (e) {
    return { email: "", boutique: "" };
  }
}

export default async function PageCompte() {
  const { email, boutique } = await charger();

  return (
    <main className="p-5 pb-28">
      <EnTete titre="Mon compte" icone="utilisateur" />

      <section className="mt-5 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#10b981,#047857)] text-2xl font-bold text-white">
            {(boutique || "N").charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-lg font-bold">{boutique || "Ma boutique"}</p>
            <p className="truncate text-sm text-slate-500">{email}</p>
          </div>
        </div>
      </section>

      <p className="mt-4 rounded-2xl bg-slate-100 p-4 text-sm text-slate-600">
        Les données de votre boutique ne sont visibles que depuis votre compte.
      </p>

      <form action={seDeconnecter} className="mt-5">
        <BoutonEnvoi ton="contour" attente="Déconnexion…">
          Se déconnecter
        </BoutonEnvoi>
      </form>

      <p className="mt-6 text-center text-xs text-slate-400">Negoce · version de test</p>
    </main>
  );
}
