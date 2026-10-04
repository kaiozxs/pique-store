import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, SSO_COOKIE } from "./lib/constants";

const PUBLIC_PATHS = ["/login", "/sso"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  const hasOwnSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  const hasSession = hasOwnSession || Boolean(request.cookies.get(SSO_COOKIE)?.value);

  if (!hasSession && !isPublic) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Só o login próprio redireciona daqui: a sessão vinda do site pode estar
  // revogada, e mandar /login para / criaria um laço com o layout.
  if (hasOwnSession && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Exclui também arquivos estáticos da pasta public/ (ex: logo.png) — sem
  // isso, o próprio otimizador de imagem do Next (que busca o arquivo sem
  // enviar o cookie de sessão) era redirecionado pro /login e a imagem
  // quebrava com "not a valid image".
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)$).*)"],
};
