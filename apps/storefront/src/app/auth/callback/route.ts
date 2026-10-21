import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { completeGoogleLogin } from "@/lib/customer";
import { COOKIE_DESTINO, destinoSeguro } from "@/lib/destino-login";

/**
 * Volta do Google: troca o código pela sessão, liga a sacola à conta e leva a
 * pessoa para onde ela estava (ou para a conta). Em qualquer falha, volta ao
 * login com a mensagem.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const destino = destinoSeguro((await cookies()).get(COOKIE_DESTINO)?.value);
  const raiz = process.env.NEXT_PUBLIC_SITE_URL ?? url.origin;

  const voltarComErro = (mensagem: string) => {
    const resposta = NextResponse.redirect(`${raiz}/conta?erro=${encodeURIComponent(mensagem)}`);
    resposta.cookies.delete(COOKIE_DESTINO);
    return resposta;
  };

  if (url.searchParams.get("error")) return voltarComErro("Login com o Google cancelado.");
  const code = url.searchParams.get("code");
  if (!code) return voltarComErro("Faltam dados do Google para concluir o login.");

  const resultado = await completeGoogleLogin(code);
  if (!resultado.ok) return voltarComErro(resultado.error);

  const resposta = NextResponse.redirect(`${raiz}${destino}`);
  resposta.cookies.delete(COOKIE_DESTINO);
  return resposta;
}
