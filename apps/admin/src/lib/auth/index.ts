import "server-only";
import { cache } from "react";
import { connection } from "next/server";
import { db, getPanelRole } from "@pique/db";
import { clienteSupabase, usaSupabase } from "./supabase";
import { devEntrar, devSair, devUsuarioAtual } from "./dev";
import type { Papel } from "../papel";

export type LoginResult = { ok: true } | { ok: false; error: string };
export type UsuarioDoPainel = { id: string; email: string; papel: Papel };

type Usuario = { id: string; email: string };

function semConfiguracao(): never {
  throw new Error("Login não configurado: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.");
}

async function usuarioDaSessao(): Promise<Usuario | null> {
  if (usaSupabase()) {
    const supabase = await clienteSupabase();
    // getClaims confere a assinatura do token aqui mesmo, sem ir ao servidor de login.
    const { data } = await supabase.auth.getClaims();
    const c = data?.claims;
    return c?.sub ? { id: c.sub, email: String(c.email ?? "") } : null;
  }
  if (process.env.NODE_ENV === "production") return null;
  return devUsuarioAtual();
}

/**
 * Quem está no painel e com qual papel.
 *
 * A sessão é a mesma da loja. O papel (dono/lojista) é conferido no banco A
 * CADA requisição — não fica gravado na sessão —, então tirar o acesso de
 * alguém vale na hora. Conta da loja sem papel não entra.
 */
export const getCurrentUser = cache(async (): Promise<UsuarioDoPainel | null> => {
  // Depende de quem está pedindo: nunca pode ser pré-renderizado no build.
  // Fica fora do try de propósito — ele sinaliza "dinâmico" lançando um erro especial.
  await connection();
  try {
    const u = await usuarioDaSessao();
    if (!u) return null;
    const papel = await getPanelRole(db(), u.id);
    return papel ? { id: u.id, email: u.email, papel } : null;
  } catch {
    return null;
  }
});

export async function login(email: string, senha: string): Promise<LoginResult> {
  let usuario: Usuario | null = null;

  if (usaSupabase()) {
    const supabase = await clienteSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
    if (error || !data.user) return { ok: false, error: "E-mail ou senha inválidos." };
    usuario = { id: data.user.id, email: data.user.email ?? email };
  } else {
    if (process.env.NODE_ENV === "production") semConfiguracao();
    usuario = await devEntrar(email.trim(), senha);
    if (!usuario) return { ok: false, error: "E-mail ou senha inválidos." };
  }

  if (!(await getPanelRole(db(), usuario.id))) {
    await logout();
    return { ok: false, error: "Esta conta não tem acesso ao painel. Peça a um dono para liberar." };
  }
  return { ok: true };
}

export async function logout(): Promise<void> {
  if (usaSupabase()) {
    const supabase = await clienteSupabase();
    await supabase.auth.signOut();
    return;
  }
  if (process.env.NODE_ENV !== "production") await devSair();
}

/**
 * Trava de segurança das ações e consultas do painel. As server actions são
 * endereços públicos: quem manda o POST certo as executa, com ou sem tela.
 * Por isso cada função da camada de dados chama isto antes de tocar no banco.
 */
export async function exigirUsuario(): Promise<UsuarioDoPainel> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Sessão expirada ou sem acesso ao painel. Entre de novo.");
  return user;
}

/** Parte financeira e gestão de acessos: só o dono. */
export async function exigirDono(): Promise<UsuarioDoPainel> {
  const user = await exigirUsuario();
  if (user.papel !== "dono") throw new Error("Só o dono acessa esta parte do painel.");
  return user;
}
