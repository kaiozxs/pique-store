import "server-only";
import { cache } from "react";
import { clienteSupabase, usaSupabase } from "./supabase";
import { devCriarConta, devEntrar, devSair, devUsuarioAtual } from "./dev";

export type Usuario = { id: string; email: string };
export type Resultado = { ok: true; usuario: Usuario } | { ok: false; error: string };

function semConfiguracao(): never {
  throw new Error("Login não configurado: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.");
}

function traduzir(mensagem: string): string {
  const m = mensagem.toLowerCase();
  if (m.includes("invalid login") || m.includes("invalid credentials")) return "E-mail ou senha inválidos.";
  if (m.includes("already registered") || m.includes("already exists")) {
    return 'Já existe uma conta com esse e-mail. Use a aba ENTRAR — ou "Esqueceu a senha?" se não lembra dela.';
  }
  if (m.includes("email not confirmed")) return "Confirme seu e-mail antes de entrar.";
  if (m.includes("rate limit") || m.includes("too many")) return "Muitas tentativas. Aguarde um pouco e tente de novo.";
  if (m.includes("password")) return "A senha não atende aos requisitos.";
  return "Não foi possível concluir agora. Tente de novo em instantes.";
}

/** Quem está logado nesta requisição (consultado uma vez por requisição). */
export const usuarioAtual = cache(async (): Promise<Usuario | null> => {
  if (usaSupabase()) {
    const supabase = await clienteSupabase();
    // getClaims confere a assinatura do token aqui mesmo, sem ir ao servidor de login.
    const { data } = await supabase.auth.getClaims();
    const c = data?.claims;
    return c?.sub ? { id: c.sub, email: String(c.email ?? "") } : null;
  }
  if (process.env.NODE_ENV === "production") return null;
  return devUsuarioAtual();
});

export async function entrarComSenha(email: string, senha: string): Promise<Resultado> {
  if (usaSupabase()) {
    const supabase = await clienteSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
    if (error || !data.user) return { ok: false, error: traduzir(error?.message ?? "invalid credentials") };
    return { ok: true, usuario: { id: data.user.id, email: data.user.email ?? email } };
  }
  if (process.env.NODE_ENV === "production") semConfiguracao();
  const u = await devEntrar(email.trim(), senha);
  return u ? { ok: true, usuario: u } : { ok: false, error: "E-mail ou senha inválidos." };
}

export async function criarConta(input: { email: string; senha: string; nome: string; sobrenome: string }): Promise<Resultado> {
  if (usaSupabase()) {
    const supabase = await clienteSupabase();
    const { data, error } = await supabase.auth.signUp({
      email: input.email.trim(),
      password: input.senha,
      options: { data: { first_name: input.nome, last_name: input.sobrenome } },
    });
    if (error) return { ok: false, error: traduzir(error.message) };
    // E-mail já existente volta como sucesso, mas sem identidades (o Supabase não revela quem já tem conta).
    if (!data.user || (data.user.identities && data.user.identities.length === 0)) {
      return { ok: false, error: traduzir("already registered") };
    }
    // Sem sessão = o projeto exige confirmar o e-mail, que a loja ainda não envia.
    if (!data.session) {
      return { ok: false, error: "Conta criada, mas é preciso confirmar o e-mail antes de entrar." };
    }
    return { ok: true, usuario: { id: data.user.id, email: data.user.email ?? input.email } };
  }
  if (process.env.NODE_ENV === "production") semConfiguracao();
  const r = await devCriarConta({ email: input.email.trim(), senha: input.senha, nome: input.nome, sobrenome: input.sobrenome });
  return r === "existe" ? { ok: false, error: traduzir("already registered") } : { ok: true, usuario: r };
}

export async function sairDaConta(): Promise<void> {
  if (usaSupabase()) {
    const supabase = await clienteSupabase();
    await supabase.auth.signOut();
    return;
  }
  if (process.env.NODE_ENV !== "production") await devSair();
}

/** Endereço da tela de login do Google, ou null quando o Google não está disponível (login de desenvolvimento). */
export async function urlDoGoogle(origem: string): Promise<string | null> {
  if (!usaSupabase()) return null;
  const supabase = await clienteSupabase();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origem}/auth/callback`, skipBrowserRedirect: true },
  });
  return error ? null : (data.url ?? null);
}

/** Termina o login do Google: troca o código pela sessão. */
export async function concluirGoogle(code: string): Promise<Resultado> {
  if (!usaSupabase()) semConfiguracao();
  const supabase = await clienteSupabase();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) return { ok: false, error: traduzir(error?.message ?? "") };
  return { ok: true, usuario: { id: data.user.id, email: data.user.email ?? "" } };
}

export async function nomesDoGoogle(): Promise<{ nome: string | null; sobrenome: string | null }> {
  if (!usaSupabase()) return { nome: null, sobrenome: null };
  const supabase = await clienteSupabase();
  const { data } = await supabase.auth.getUser();
  const meta = (data.user?.user_metadata ?? {}) as Record<string, string | undefined>;
  return {
    nome: meta.given_name ?? meta.first_name ?? meta.full_name?.split(" ")[0] ?? null,
    sobrenome: meta.family_name ?? meta.last_name ?? meta.full_name?.split(" ").slice(1).join(" ") ?? null,
  };
}
