import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const ROTAS_PUBLICAS = ["/login"];
// Mesmo cookie do login de desenvolvimento da loja (só existe fora de produção).
const COOKIE_DEV = "piquestore_dev_session";

/**
 * Barra quem não tem sessão e mantém o login vivo (renova o token do Supabase
 * a cada navegação, como a loja faz). Só confere a PRESENÇA da sessão aqui; o
 * papel de verdade é validado no banco pelo layout do painel.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl; // sem o /admin do basePath
  const publica = ROTAS_PUBLICAS.some((p) => pathname.startsWith(p));
  const cookiesDoSupabase = request.cookies.getAll().some((c) => c.name.startsWith("sb-"));
  const temSessao = cookiesDoSupabase || Boolean(request.cookies.get(COOKIE_DEV)?.value);

  if (!temSessao && !publica) {
    const login = request.nextUrl.clone();
    login.pathname = "/login";
    login.search = "";
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !chave || !cookiesDoSupabase) return NextResponse.next();

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
  // Exclui também arquivos estáticos da pasta public/ (ex: logo.png) — sem
  // isso, o otimizador de imagem do Next (que busca o arquivo sem o cookie de
  // sessão) era mandado para /login e a imagem quebrava.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)$).*)"],
};
