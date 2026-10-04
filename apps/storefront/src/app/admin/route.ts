import { NextResponse } from "next/server";
import { sdk } from "@/lib/sdk";
import { getCustomerToken } from "@/lib/customer-session";
import { emitirBilhete } from "@/lib/admin-sso";
import { getCurrentCustomer } from "@/lib/customer";

/**
 * /admin — entra no painel com o login da loja.
 *
 * Quem não está logado vai para a tela de login. Quem está logado mas não tem
 * acesso cai na home sem nenhuma pista de que o painel existe. A permissão é
 * decidida no backend (tabela própria), nunca por algo que o cliente possa
 * editar no próprio cadastro.
 */
export async function GET(request: Request) {
  const raiz = new URL("/", request.url);
  const painel = process.env.ADMIN_APP_URL;
  const token = await getCustomerToken();
  if (!token) return NextResponse.redirect(new URL("/conta", request.url));
  if (!painel) return NextResponse.redirect(raiz);

  try {
    const { papel } = await sdk.client.fetch<{ papel: "dono" | "lojista" | null }>("/store/acesso/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const cliente = await getCurrentCustomer();
    if (!papel || !cliente) return NextResponse.redirect(raiz);

    const bilhete = emitirBilhete({ cid: cliente.id, email: cliente.email });
    if (!bilhete) return NextResponse.redirect(raiz);

    const destino = new URL("/sso", painel);
    destino.searchParams.set("t", bilhete);
    return NextResponse.redirect(destino);
  } catch {
    return NextResponse.redirect(raiz);
  }
}
