import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function usaSupabase(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/**
 * Cookies do login: 30 dias, só o servidor lê (httpOnly), e só por HTTPS em
 * produção. O navegador nunca precisa enxergar o token — todo o login passa
 * por ações do servidor.
 */
export const COOKIE_OPCOES = {
  maxAge: 60 * 60 * 24 * 30,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  httpOnly: true,
  path: "/",
};

export async function clienteSupabase() {
  const jar = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookieOptions: COOKIE_OPCOES,
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (lista) => {
        try {
          for (const { name, value, options } of lista) jar.set(name, value, options);
        } catch {
          // Chamado de um Server Component, que não pode gravar cookie: tudo
          // bem, o proxy renova a sessão a cada navegação.
        }
      },
    },
  });
}
