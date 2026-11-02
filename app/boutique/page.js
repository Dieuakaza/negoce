import { headers } from "next/headers";
import { getSupabase } from "../../lib/supabase";
import { enregistrerBoutique } from "./actions";
import { versLien } from "../../lib/texte";
import { EnTete, Alerte, Champ, Zone } from "../../components/ui";
import BoutonEnvoi from "../../components/BoutonEnvoi";

export const dynamic = "force-dynamic";

async function charger() {
  try {
    const { data, error } = await getSupabase()
      .from("boutiques")
      .select("id, nom, slug, description, whatsapp, ville, publiee")
      .limit(1);
    if (error) return { boutique: null, erreur: error.message };
    return { boutique: data?.[0] || null, erreur: null };
  } catch (e) {
    return { boutique: null, erreur: e.message };
  }
}

export default async function PageBoutique({ searchParams }) {
  const params = await searchParams;
  const entetes = await headers();
  const hote = entetes.get("host") || "negoce-mu.vercel.app";
  const { boutique: b, erreur } = await charger();

  return (
    <main className="p-5 pb-28">
      <EnTete titre="Ma boutique en ligne" icone="sac" sous="Ce que tes clients verront" />

      {params?.ok && <Alerte>Boutique enregistrée.</Alerte>}
      {params?.erreur && <Alerte type="erreur">{params.erreur}</Alerte>}
      {erreur && (
        <Alerte type="erreur">
          <p>Connexion à la base de données impossible</p>
          <p className="mt-1 font-normal">{erreur}</p>
        </Alerte>
      )}

      {b && (
        <>
          {b.slug && (
            <div className="mt-4 rounded-2xl bg-emerald-50 p-4">
              <p className="text-xs text-emerald-800">Ton lien partageable</p>
              <p className="mt-1 break-all text-sm font-bold text-emerald-900">
                https://{hote}/b/{b.slug}
              </p>
              <p className="mt-2 text-xs text-emerald-800">
                {b.publiee
                  ? "Boutique publiée. "
                  : "Boutique non publiée : tu es la seule personne à pouvoir la voir. "}
                La page publique sera activée à la prochaine étape.
              </p>
            </div>
          )}

          <form
            action={enregistrerBoutique}
            className="mt-5 space-y-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100"
          >
            <input type="hidden" name="id" value={b.id} />
            <Champ label="Nom de ta boutique" name="nom" type="text" defaultValue={b.nom} placeholder="Ex : Chez Awa" />
            <Champ
              label="Lien de ta boutique"
              name="slug"
              type="text"
              defaultValue={b.slug || versLien(b.nom)}
              placeholder="chez-awa"
              requis={false}
              aide="Lettres, chiffres et tirets. Ce sera la fin de ton lien."
            />
            <Champ
              label="Numéro WhatsApp"
              name="whatsapp"
              type="tel"
              defaultValue={b.whatsapp}
              placeholder="Ex : 0700000000"
              requis={false}
              aide="Côte d’Ivoire : ton numéro à 10 chiffres suffit, on ajoute +225. Autre pays : numéro complet avec l’indicatif."
            />
            <Champ label="Ville" name="ville" type="text" defaultValue={b.ville} placeholder="Ex : Abidjan" requis={false} />
            <Zone
              label="Description de ta boutique"
              name="description"
              defaultValue={b.description}
              placeholder="Ce que tu vends, tes horaires, ta zone de livraison…"
              maxLength={500}
            />
            <label className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
              <input
                type="checkbox"
                name="publiee"
                defaultChecked={b.publiee}
                className="h-5 w-5 shrink-0 accent-emerald-600"
              />
              <span className="text-sm font-medium text-slate-700">
                Rendre ma boutique visible par mes clients
              </span>
            </label>
            <BoutonEnvoi>Enregistrer ma boutique</BoutonEnvoi>
          </form>
        </>
      )}
    </main>
  );
}
