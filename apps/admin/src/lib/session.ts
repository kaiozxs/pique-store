import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE, SSO_COOKIE } from "./constants";
import { verificarSessaoSso } from "./sso";
import { tokenDeServico } from "./service-token";

// Guarda o JWT de admin do Medusa (obtido em /auth/user/emailpass) num cookie
// httpOnly do próprio app — nunca fica acessível a JS do navegador.

export async function getSessionToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

export async function setSessionToken(token: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    // JWT padrão do Medusa expira em 24h — o cookie acompanha esse prazo.
    maxAge: 60 * 60 * 24,
  });
}

export async function clearSessionToken(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getSsoSession() {
  const store = await cookies();
  return verificarSessaoSso(store.get(SSO_COOKIE)?.value);
}

export async function setSsoCookie(valor: string): Promise<void> {
  const store = await cookies();
  store.set(SSO_COOKIE, valor, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function clearSsoCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SSO_COOKIE);
}

export async function authHeaders(): Promise<Record<string, string>> {
  const token = await getSessionToken();
  if (token) return { Authorization: `Bearer ${token}` };

  // Sem login próprio do painel: vale a sessão vinda do site, que usa a conta
  // de serviço para falar com o backend.
  if (await getSsoSession()) {
    const servico = await tokenDeServico();
    if (servico) return { Authorization: `Bearer ${servico}` };
  }
  return {};
}
