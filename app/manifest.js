export default function manifest() {
  return {
    name: "Negoce",
    short_name: "Negoce",
    description: "Gérez votre commerce simplement depuis votre téléphone.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f8fafc",
    theme_color: "#059669",
    lang: "fr",
    icons: [
      { src: "/icone?t=192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icone?t=512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icone?t=512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
