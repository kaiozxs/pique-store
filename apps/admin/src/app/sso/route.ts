import { NextResponse } from "next/server";
import { verificarBilhete, criarSessaoSso } from "@/lib/sso";
import { setSsoCookie } from "@/lib/session";

// Destino do /admin do site: troca o bilhete assinado por uma sessão do painel.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const dados = verificarBilhete(url.searchParams.get("t"));
  const sessao = dados ? criarSessaoSso({ cid: dados.cid, email: dados.email }) : null;

  if (!sessao) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  await setSsoCookie(sessao);
  // Redireciona para a raiz limpa: o bilhete não fica na barra de endereço.
  return NextResponse.redirect(new URL("/", request.url));
}
