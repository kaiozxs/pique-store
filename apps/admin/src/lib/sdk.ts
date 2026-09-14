import "server-only";
import Medusa from "@medusajs/js-sdk";

// SDK usado só no servidor (Server Components / Server Actions / Route Handlers).
// O token do admin é gerido por nós via cookie httpOnly (ver session.ts) e
// passado manualmente como header em cada chamada — o navegador nunca fala
// direto com o Medusa.
export const sdk = new Medusa({
  baseUrl: process.env.MEDUSA_BACKEND_URL ?? "http://localhost:9000",
  debug: process.env.NODE_ENV === "development",
});
