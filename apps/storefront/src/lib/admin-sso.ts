import "server-only";
import { createHmac, randomBytes } from "node:crypto";

/**
 * Bilhete de passagem do site para o painel.
 *
 * O painel é outro aplicativo, em outro endereço: não enxerga o cookie de
 * login da loja. Então o site, depois de confirmar no backend que a pessoa
 * tem acesso, entrega um bilhete assinado e de vida curta (60s) que o painel
 * troca por uma sessão própria. O segredo nunca sai dos dois servidores.
 */
export function emitirBilhete(dados: { cid: string; email: string }): string | null {
  const segredo = process.env.ADMIN_SSO_SECRET;
  if (!segredo || segredo.length < 32) return null;

  const corpo = Buffer.from(
    JSON.stringify({ ...dados, exp: Date.now() + 60_000, n: randomBytes(8).toString("hex") })
  ).toString("base64url");
  const assinatura = createHmac("sha256", segredo).update(corpo).digest("base64url");
  return `${corpo}.${assinatura}`;
}
