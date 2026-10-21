import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Mantém o login vivo. O token de acesso do Supabase dura pouco; a cada
 * navegação, quem tem sessão tem o token renovado e o cookie regravado aqui.
 * Sem isso, a pessoa seria "deslogada" depois de uma hora.
 *
 * Visitante sem cookie de login passa direto, sem custo nenhum.
 */
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const temSessao = request.cookies.getAll().some((c) => c.name.startsWith("sb-"));
  if (!url || !chave || !temSessao) return NextResponse.next();

  let resposta = NextResponse.next({ request });
  const supabase = createServerClient(url, chave, {
    // Mesmas opções de lib/auth/supabase.ts (aquele arquivo usa next/headers e não roda aqui).
    cookieOptions: {
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      path: "/",
    },
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (lista) => {
        for (const { name, value } of lista) request.cookies.set(name, value);
        resposta = NextResponse.next({ request });
        for (const { name, value, options } of lista) resposta.cookies.set(name, value, options);
      },
    },
  });
  await supabase.auth.getClaims();
  return resposta;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|produtos/|images/|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|txt|xml)$).*)"],
};
