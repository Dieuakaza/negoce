import { imageIcone } from "../../lib/logo";

export function GET(request) {
  const taille = new URL(request.url).searchParams.get("t");
  return imageIcone(taille === "192" ? 192 : 512);
}
