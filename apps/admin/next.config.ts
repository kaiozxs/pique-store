import type { NextConfig } from "next";
import path from "node:path";
import { loadEnvConfig } from "@next/env";

// next.config.ts roda fora do pipeline normal do Next: sem isso o .env.local
// não vem carregado aqui e a leitura abaixo cairia no valor vazio.
loadEnvConfig(process.cwd());

// Sem Content-Security-Policy aqui de propósito: diferente do storefront,
// não mapeei com confiança tudo que o painel carrega em runtime (câmera do
// leitor de QR, pré-visualização de mídia), e travar demais aqui quebra a
// ferramenta que a loja usa todo dia pra operar. Os headers abaixo são as
// proteções que não têm esse risco.
const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

// Fotos dos produtos: ficam no Supabase Storage (bucket público "produtos").
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_HOST = SUPABASE_URL ? new URL(SUPABASE_URL).hostname : null;

const nextConfig: NextConfig = {
  // O painel mora em /admin do mesmo endereço da loja (a loja repassa o tráfego
  // para cá). Assim os dois enxergam o mesmo cookie de login.
  basePath: "/admin",
  // O pacote de dados fica fora desta pasta, em ../../packages/db, e é TypeScript.
  transpilePackages: ["@pique/db"],
  turbopack: { root: path.resolve(process.cwd(), "..", "..") },
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
  images: {
    remotePatterns: SUPABASE_HOST
      ? [{ protocol: "https", hostname: SUPABASE_HOST, pathname: "/storage/v1/object/public/**" }]
      : [],
  },
};

export default nextConfig;
