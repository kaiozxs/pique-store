import type { Metadata } from "next";
import { getCart } from "@/lib/cart";
import { getCurrentCustomer } from "@/lib/customer";
import { CheckoutClient } from "./CheckoutClient";

export const metadata: Metadata = { title: "Checkout — PIQUE" };

// Hoje a loja entrega só no Brasil. Para abrir outro país, é só incluí-lo aqui.
const PAISES = [{ code: "br", label: "Brasil" }];

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string }>;
}) {
  // Não redireciona aqui pra sacola vazia: completar o checkout também
  // esvazia a sacola, e um redirect nesse ponto faria essa mesma página
  // "chutar" o cliente pra /sacola bem na hora de mostrar a confirmação do
  // pedido (toda Server Action re-renderiza essa página). Quem decide o que
  // mostrar quando não há sacola é o CheckoutClient, com base no próprio
  // estado local (se já tem um pedido confirmado ou não).
  const [cart, customer, { step }] = await Promise.all([getCart(), getCurrentCustomer(), searchParams]);

  return (
    <CheckoutClient
      initialCart={cart}
      countries={PAISES}
      hasAccount={!!customer}
      initialStep={step === "pagamento" ? "pagamento" : "endereco"}
    />
  );
}
