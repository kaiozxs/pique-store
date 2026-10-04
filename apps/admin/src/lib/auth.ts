import "server-only";
import { sdk } from "./sdk";
import { authHeaders, clearSessionToken, clearSsoCookie, getSessionToken, getSsoSession, setSessionToken } from "./session";
import type { Papel } from "./papel";

export type LoginResult = { ok: true } | { ok: false; error: string };

export async function login(email: string, password: string): Promise<LoginResult> {
  try {
    const result = await sdk.auth.login("user", "emailpass", { email, password });

    if (typeof result !== "string") {
      // Login exige um passo extra (MFA, redirect de terceiro etc.) — não
      // suportado neste painel por enquanto.
      return { ok: false, error: "Este login exige uma etapa adicional não suportada aqui." };
    }

    await setSessionToken(result);
    return { ok: true };
  } catch {
    return { ok: false, error: "E-mail ou senha inválidos." };
  }
}

export async function logout(): Promise<void> {
  await clearSessionToken();
  await clearSsoCookie();
}

export type UsuarioDoPainel = { email: string; papel: Papel };

/**
 * Quem está no painel e com qual papel.
 *
 * Login próprio do painel (usuário admin do Medusa) é dono. Sessão vinda do
 * site tem o papel conferido no backend A CADA chamada — não fica gravado na
 * sessão —, então tirar o acesso de alguém vale na hora.
 */
export async function getCurrentUser(): Promise<UsuarioDoPainel | null> {
  try {
    const headers = await authHeaders();
    if (!headers.Authorization) return null;

    if (await getSessionToken()) {
      const { user } = await sdk.admin.user.me({}, headers);
      return user ? { email: user.email, papel: "dono" } : null;
    }

    const sso = await getSsoSession();
    if (!sso) return null;
    const { acessos } = await sdk.client.fetch<{ acessos: { papel: Papel }[] }>(
      `/admin/acessos?customer_id=${encodeURIComponent(sso.cid)}`,
      { headers, cache: "no-store" }
    );
    return acessos[0] ? { email: sso.email, papel: acessos[0].papel } : null;
  } catch {
    return null;
  }
}
