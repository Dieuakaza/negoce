import { getSupabase } from "../../../lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { count } = await getSupabase()
      .from("commandes")
      .select("id", { count: "exact", head: true })
      .eq("statut", "nouvelle");
    return Response.json({ n: count || 0 });
  } catch {
    return Response.json({ n: 0 });
  }
}
