"use client";

import { sdk } from "./sdk";

// Onde a pessoa deve ser levada de volta depois que o login com o Google
// terminar — a própria callback da Google já traz de volta pra essa mesma
// aba/origem, então isso só precisa sobreviver ao passeio até o Google e
// de volta (sessionStorage é suficiente e não exige nenhuma mudança no
// backend).
const RETURN_TO_KEY = "piquestore_post_google_login";

export function getPostGoogleLoginRedirect(): string {
  try {
    return sessionStorage.getItem(RETURN_TO_KEY) ?? "/conta";
  } catch {
    return "/conta";
  } finally {
    try {
      sessionStorage.removeItem(RETURN_TO_KEY);
    } catch {
      // ignora
    }
  }
}

export async function startGoogleLogin(returnTo: string = "/conta"): Promise<void> {
  try {
    sessionStorage.setItem(RETURN_TO_KEY, returnTo);
  } catch {
    // segue sem lembrar o destino — cai no fallback "/conta"
  }

  const result = await sdk.auth.login("customer", "google", {
    callback_url: `${window.location.origin}/auth/google/callback`,
  });

  if (typeof result === "object" && "location" in result) {
    window.location.href = result.location;
    return;
  }

  // Não deveria acontecer pro provider do Google (sempre exige o redirect),
  // mas por segurança: se por algum motivo já vier autenticado, recarrega.
  window.location.href = returnTo;
}
