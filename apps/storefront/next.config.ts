import type { NextConfig } from "next";
import { loadEnvConfig } from "@next/env";

// next.config.ts roda fora do pipeline normal do Next, então `process.env`
// não vem carregado com o .env.local/.env sozinho nesse ponto — sem isso, a
// leitura abaixo silenciosamente cai no fallback embutido no código em vez
// da URL real de produção.
loadEnvConfig(process.cwd());

// Domínios de terceiros que o storefront realmente precisa liberar: o Brick
// do Mercado Pago (script + iframes seguros de cartão) e o ViaCEP (consulta
// de CEP direto do navegador). O backend Medusa entra à parte logo abaixo —
// o login com Google (lib/google-auth.ts) chama ele direto do navegador, sem
// passar por Server Action, então precisa estar liberado explicitamente
// (imagens continuam via `next/image`, que busca do lado do servidor).
const MERCADOPAGO_DOMAINS = "https://*.mercadopago.com https://*.mercadolibre.com https://http2.mlstatic.com";
const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${MERCADOPAGO_DOMAINS}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https:`,
  "font-src 'self' data:",
  `connect-src 'self' ${BACKEND_URL} https://viacep.com.br https://accounts.google.com ${MERCADOPAGO_DOMAINS}`,
  `frame-src 'self' ${MERCADOPAGO_DOMAINS}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
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
      // Mídia enviada pelo backend Medusa em produção (Railway).
      { protocol: "https", hostname: "pique-store-production.up.railway.app" },
    ],
    // O Next 16 bloqueia por padrão otimizar imagem vinda de IP privado/loopback
    // (proteção contra SSRF) — precisa liberar explicitamente pro backend local.
    dangerouslyAllowLocalIP: true,
  },
};

export default nextConfig;
