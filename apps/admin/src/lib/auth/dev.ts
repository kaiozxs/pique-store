import "server-only";
import { createHmac, scrypt, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { db } from "@pique/db";

/**
 * LOGIN DE DESENVOLVIMENTO — só para testar o painel na máquina, sem o Supabase.
 * Lê a mesma sessão que a loja grava (mesmo cookie, mesmo segredo), então quem
 * entra na loja local já está dentro do painel.
 *
 * Nunca roda em produção: todas as funções recusam quando NODE_ENV é
 * "production", e `lib/auth/index.ts` só chega aqui se o Supabase não estiver
 * configurado.
 */
const COOKIE = "piquestore_dev_session";
const SEGREDO = process.env.DEV_AUTH_SECRET ?? "dev-somente-local";

function proibirEmProducao() {
  if (process.env.NODE_ENV === "production") throw new Error("Login de desenvolvimento não existe em produção.");
}

function hash(senha: string, sal: string): Promise<string> {
  return new Promise((resolve, reject) =>
    scrypt(senha, sal, 32, (erro, chave) => (erro ? reject(erro) : resolve(chave.toString("hex"))))
  );
}

function assinar(id: string): string {
  return `${id}.${createHmac("sha256", SEGREDO).update(id).digest("hex")}`;
}

export const COOKIE_DEV = COOKIE;

export async function devUsuarioAtual(): Promise<{ id: string; email: string } | null> {
  proibirEmProducao();
  const valor = (await cookies()).get(COOKIE)?.value;
  if (!valor) return null;
  const [id, assinatura] = valor.split(".");
  if (!id || !assinatura) return null;
  const esperado = Buffer.from(assinar(id).split(".")[1]!);
  const recebido = Buffer.from(assinatura);
  if (esperado.length !== recebido.length || !timingSafeEqual(esperado, recebido)) return null;
  const [c] = await db()<{ email: string }>`select email from customers where id = ${id}`;
  return c ? { id, email: c.email } : null;
}

export async function devEntrar(email: string, senha: string): Promise<{ id: string; email: string } | null> {
  proibirEmProducao();
  await db().unsafe(
    `create table if not exists dev_credentials (customer_id uuid primary key, sal text not null, hash text not null)`
  );
  const [c] = await db()<{ id: string; email: string; sal: string; hash: string }>`
    select c.id, c.email, d.sal, d.hash from customers c join dev_credentials d on d.customer_id = c.id
    where lower(c.email) = lower(${email})`;
  if (!c) return null;
  const tentativa = Buffer.from(await hash(senha, c.sal));
  const guardado = Buffer.from(c.hash);
  if (tentativa.length !== guardado.length || !timingSafeEqual(tentativa, guardado)) return null;
  (await cookies()).set(COOKIE, assinar(c.id), { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
  return { id: c.id, email: c.email };
}

export async function devSair() {
  proibirEmProducao();
  (await cookies()).delete(COOKIE);
}
