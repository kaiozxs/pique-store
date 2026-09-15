import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Imagens de exemplo dos produtos demo do Medusa (seed inicial).
      { protocol: "https", hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com" },
      // Mídia enviada pelo próprio backend Medusa em desenvolvimento.
      { protocol: "http", hostname: "localhost", port: "9000" },
    ],
    // O Next 16 bloqueia por padrão otimizar imagem vinda de IP privado/loopback
    // (proteção contra SSRF) — precisa liberar explicitamente pro backend local.
    dangerouslyAllowLocalIP: true,
  },
};

export default nextConfig;
