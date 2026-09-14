import type { Metadata } from "next";
import { getCart } from "@/lib/cart";
import { getDefaultRegion } from "@/lib/medusa";
import { CheckoutClient } from "./CheckoutClient";

export const metadata: Metadata = { title: "Checkout — PIQUE" };

export default async function CheckoutPage() {
  // Não redireciona aqui pra sacola vazia: completar o checkout também
  // esvazia o carrinho, e um redirect nesse ponto faria essa mesma página
  // "chutar" o cliente pra /sacola bem na hora de mostrar a confirmação do
  // pedido (toda Server Action re-renderiza essa página). Quem decide o que
  // mostrar quando não há carrinho é o CheckoutClient, com base no próprio
  // estado local (se já tem um pedido confirmado ou não).
  const cart = await getCart();

  const region = await getDefaultRegion();
  const countries = (region.countries ?? [])
    .filter((c): c is typeof c & { iso_2: string } => Boolean(c.iso_2))
    .map((c) => ({ code: c.iso_2, label: c.display_name ?? c.name ?? c.iso_2 }));

  return <CheckoutClient initialCart={cart} countries={countries} />;
}
