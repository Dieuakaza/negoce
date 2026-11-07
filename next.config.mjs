// Réglages de sécurité envoyés avec chaque page
const entetesSecurite = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "microphone=(), geolocation=()" },
];

const config = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: entetesSecurite }];
  },
};

export default config;
