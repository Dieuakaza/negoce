import { headers } from "next/headers";
import { getSupabase } from "../../lib/supabase";
import { enregistrerBoutique } from "./actions";
import { versLien } from "../../lib/texte";
import { EnTete, Alerte, Champ, Zone } from "../../components/ui";
import BoutonEnvoi from "../../components/BoutonEnvoi";
import BoutonPartager from "../../components/BoutonPartager";

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
  const lien = b?.slug ? "https://" + hote + "/b/" + b.slug : "";

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
              <p className="mt-1 break-all text-sm font-bold text-emerald-900">{lien}</p>

              {b.publiee ? (
                <>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <a
                      href={lien}
                      target="_blank"
                      rel="noopener"
                      className="flex items-center justify-center rounded-xl bg-white px-3 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm active:bg-emerald-50"
                    >
                      Voir ma boutique
                    </a>
                    <BoutonPartager
                      url={lien}
                      titre={b.nom}
                      texte={"Découvre ma boutique " + b.nom}
                      className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white active:bg-emerald-700"
                    />
                  </div>
                  <p className="mt-3 text-xs text-emerald-800">
                    Colle ce lien dans ta bio TikTok ou Facebook, dans ton statut WhatsApp, ou envoie-le directement à
                    tes clients.
                  </p>
                </>
              ) : (
                <p className="mt-2 text-xs text-emerald-800">
                  Ta boutique n’est pas encore publiée : coche « Rendre ma boutique visible » ci-dessous, puis
                  enregistre.
                </p>
              )}
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
              <span className="text-sm font-medium text-slate-700">Rendre ma boutique visible par mes clients</span>
            </label>
            <BoutonEnvoi>Enregistrer ma boutique</BoutonEnvoi>
          </form>
        </>
      )}
    </main>
  );
}
