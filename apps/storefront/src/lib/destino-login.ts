// Para onde levar a pessoa depois de entrar com o Google. Fica num cookie
// curto porque ela sai do site e volta pelo /auth/callback.

export const COOKIE_DESTINO = "piquestore_pos_login";

/** Só caminho interno do próprio site: nunca endereço de fora (evita redirecionamento aberto). */
export function destinoSeguro(valor: string | undefined | null, padrao = "/conta"): string {
  if (!valor || !valor.startsWith("/") || valor.startsWith("//") || valor.includes("\\")) return padrao;
  return valor;
}
