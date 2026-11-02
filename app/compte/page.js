import { getSupabase } from "../../lib/supabase";
import { seDeconnecter } from "../connexion/actions";

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
    <main className="p-5 pb-24">
      <h1 className="text-2xl font-bold">Mon compte</h1>

      <div className="mt-5 space-y-3 rounded-2xl bg-white p-4 shadow-sm">
        <div>
          <p className="text-xs text-slate-500">Boutique</p>
          <p className="font-semibold">{boutique || "—"}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Adresse e-mail</p>
          <p className="break-words font-semibold">{email || "—"}</p>
        </div>
      </div>

      <form action={seDeconnecter} className="mt-5">
        <button
          type="submit"
          className="w-full rounded-xl border border-red-200 bg-white px-4 py-3 text-base font-semibold text-red-600 active:bg-red-50"
        >
          Se déconnecter
        </button>
      </form>
    </main>
  );
}
