import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

// Verificação do bilhete vindo do site e da sessão que o painel cria a partir
// dele. Mesma assinatura (HMAC-SHA256) dos dois lados.

function segredo(): string | null {
  const s = process.env.ADMIN_SSO_SECRET;
  return s && s.length >= 32 ? s : null;
}

function assinar(corpo: string, chave: string): string {
  return createHmac("sha256", chave).update(corpo).digest("base64url");
}

function abrir<T extends { exp: number }>(valor: string | undefined | null): T | null {
  const chave = segredo();
  if (!chave || !valor) return null;
  const [corpo, assinatura] = valor.split(".");
  if (!corpo || !assinatura) return null;

  const esperada = Buffer.from(assinar(corpo, chave));
  const recebida = Buffer.from(assinatura);
  if (esperada.length !== recebida.length || !timingSafeEqual(esperada, recebida)) return null;

  try {
    const dados = JSON.parse(Buffer.from(corpo, "base64url").toString("utf8")) as T;
    return dados.exp > Date.now() ? dados : null;
  } catch {
    return null;
  }
}

export type DadosSso = { cid: string; email: string; exp: number };

export const verificarBilhete = (t: string | null | undefined) => abrir<DadosSso>(t);
export const verificarSessaoSso = (c: string | null | undefined) => abrir<DadosSso>(c);

export function criarSessaoSso(dados: { cid: string; email: string }): string | null {
  const chave = segredo();
  if (!chave) return null;
  // 12h: o papel é conferido no backend a cada página, então revogar vale na hora.
  const corpo = Buffer.from(JSON.stringify({ ...dados, exp: Date.now() + 12 * 60 * 60 * 1000 })).toString("base64url");
  return `${corpo}.${assinar(corpo, chave)}`;
}
