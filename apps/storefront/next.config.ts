import type { NextConfig } from "next";
import path from "node:path";
import { loadEnvConfig } from "@next/env";

// next.config.ts roda fora do pipeline normal do Next, então `process.env`
// não vem carregado com o .env.local/.env sozinho nesse ponto — sem isso, a
// leitura abaixo silenciosamente cai no fallback embutido no código em vez
// da URL real de produção.
loadEnvConfig(process.cwd());

// Domínios de terceiros que o storefront realmente precisa liberar: o Brick
// do Mercado Pago (script + iframes seguros de cartão) e o ViaCEP (consulta
// de CEP direto do navegador). O login e o banco são sempre chamados pelo
// servidor, então não entram aqui.
const MERCADOPAGO_DOMAINS = "https://*.mercadopago.com https://*.mercadolibre.com https://http2.mlstatic.com";

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  // O modo de desenvolvimento do Next usa eval (recarga a quente, pilhas de erro). Em produção não existe.
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "production" ? "" : " 'unsafe-eval'"} ${MERCADOPAGO_DOMAINS}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https:`,
  "font-src 'self' data:",
  `connect-src 'self' https://viacep.com.br ${MERCADOPAGO_DOMAINS}`,
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
  { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
];

// Fotos dos produtos: ficam no Supabase Storage (bucket público "produtos").
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_HOST = SUPABASE_URL ? new URL(SUPABASE_URL).hostname : null;

// O painel é outro aplicativo, servido sob /admin deste mesmo endereço (assim os
// dois compartilham o login). Só ativa quando ADMIN_APP_URL está definida.
const ADMIN_APP_URL = process.env.ADMIN_APP_URL?.replace(/\/$/, "");

const nextConfig: NextConfig = {
  // O pacote de dados fica fora desta pasta, em ../../packages/db, e é TypeScript.
  transpilePackages: ["@pique/db"],
  turbopack: { root: path.resolve(process.cwd(), "..", "..") },
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
  async rewrites() {
    if (!ADMIN_APP_URL) return [];
    return [
      { source: "/admin", destination: `${ADMIN_APP_URL}/admin` },
      { source: "/admin/:path*", destination: `${ADMIN_APP_URL}/admin/:path*` },
    ];
  },
  images: {
    remotePatterns: SUPABASE_HOST
      ? [{ protocol: "https", hostname: SUPABASE_HOST, pathname: "/storage/v1/object/public/**" }]
      : [],
  },
};

export default nextConfig;
