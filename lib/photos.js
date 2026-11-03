// Adresse publique d’une photo rangée dans le dossier « produits »
export function urlPhoto(chemin) {
  return process.env.SUPABASE_URL + "/storage/v1/object/public/produits/" + chemin;
}
