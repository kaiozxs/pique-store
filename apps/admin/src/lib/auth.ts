import "server-only";
import { sdk } from "./sdk";
import { authHeaders, clearSessionToken, setSessionToken } from "./session";

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
}

export async function getCurrentUser() {
  try {
    const headers = await authHeaders();
    if (!headers.Authorization) return null;
    const { user } = await sdk.admin.user.me({}, headers);
    return user;
  } catch {
    return null;
  }
}
