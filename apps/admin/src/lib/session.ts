import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "./constants";

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

export async function authHeaders(): Promise<Record<string, string>> {
  const token = await getSessionToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
