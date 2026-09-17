import type { NextConfig } from "next";

// Sem Content-Security-Policy aqui de propósito: diferente do storefront,
// não mapeei com confiança tudo que o dashboard do admin carrega em runtime,
// e travar demais aqui quebra a ferramenta que a loja usa todo dia pra
// operar. Os headers abaixo são as proteções que não têm esse risco.
const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
  images: {
    remotePatterns: [
      // Imagens de exemplo dos produtos demo do Medusa (seed inicial).
      { protocol: "https", hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com" },
      // Mídia enviada pelo próprio backend Medusa em desenvolvimento.
      { protocol: "http", hostname: "localhost", port: "9000" },
    ],
  },
};

export default nextConfig;
