import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentCustomer, getCustomerOrder } from "@/lib/customer";
import { formatMoney } from "@/lib/medusa";
import { statusDoPedido } from "@/lib/order-status";
import { variantTitleLabel } from "@/lib/tamanhos";
import { LinhaDoTempo } from "@/components/pedido/LinhaDoTempo";

export const metadata: Metadata = { title: "Pedido — PIQUE" };

const SUPPORT_EMAIL = "piquecompanysuporte@gmail.com";

function Linha({ rotulo, valor, forte }: { rotulo: string; valor: string; forte?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between gap-4 ${forte ? "text-base font-bold" : "text-sm"}`}>
      <span className={forte ? "text-paper" : "text-paper/55"}>{rotulo}</span>
      <span className={forte ? "text-paper" : "text-paper/80"}>{valor}</span>
    </div>
  );
}

export default async function PedidoPage(props: PageProps<"/conta/pedidos/[id]">) {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/conta");

  const { id } = await props.params;
  const order = await getCustomerOrder(id);
  if (!order) notFound();

  const status = statusDoPedido(order);
  const moeda = order.currency_code;
  const endereco = order.shipping_address;

  // Rastreio: enquanto a integração com os Correios não existe, o código é
  // digitado no painel e fica guardado no próprio pedido. A API de loja do
  // Medusa não devolve as etiquetas da remessa, então essa é a fonte. Aceita
  // mais de um código separado por vírgula (pedido que vai em duas caixas).
  const rastreios = String(
    (order.metadata as Record<string, unknown> | null)?.tracking_numbers ??
      (order.metadata as Record<string, unknown> | null)?.tracking_number ??
      ""
  )
    .split(",")
    .map((codigo) => codigo.trim())
    .filter(Boolean);

  const pagamentos = (order.payment_collections ?? []).flatMap((c) => c.payments ?? []);
  // Só afirma o meio quando dá pra reconhecer: "registrado no pedido" não
  // informa nada a quem comprou.
  const meioDePagamento = pagamentos.some((p) => p.provider_id?.includes("mercadopago"))
    ? "Cartão · Mercado Pago"
    : null;

  return (
    <div className="bg-ink text-paper">
      <div className="mx-auto max-w-3xl px-6 py-16 sm:px-8">
        <Link
          href="/conta"
          className="mb-8 inline-flex items-center gap-2 text-[12px] font-bold tracking-[0.1em] text-paper/50 transition-colors hover:text-accent"
        >
          ← MINHA CONTA
        </Link>

        <div className="mb-2 text-[13px] font-semibold tracking-[0.28em] text-paper/50">PEDIDO</div>
        <h1 className="font-display text-3xl tracking-wide sm:text-5xl">#{order.display_id}</h1>
        <p className="mt-3 text-sm text-paper/55">
          Feito em{" "}
          {new Date(order.created_at).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </p>

        <section className="mt-10">
          <LinhaDoTempo status={status} />
        </section>

        {rastreios.length > 0 && (
          <section className="mt-8 border border-white/15 px-5 py-4">
            <div className="mb-2 text-[11px] font-bold tracking-[0.14em] text-paper/60">
              CÓDIGO DE RASTREIO
            </div>
            <div className="flex flex-col gap-2">
              {rastreios.map((codigo) => (
                <a
                  key={codigo}
                  href={`https://rastreamento.correios.com.br/app/index.php?objetos=${codigo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm font-semibold text-paper underline underline-offset-4 transition-colors hover:text-accent"
                >
                  {codigo}
                </a>
              ))}
            </div>
            <p className="mt-2 text-xs text-paper/45">Acompanhe direto no site dos Correios.</p>
          </section>
        )}

        <section className="mt-12">
          <h2 className="mb-5 text-sm font-bold tracking-[0.1em] text-paper/70">ITENS</h2>
          <div className="flex flex-col divide-y divide-white/10 border-y border-white/10">
            {(order.items ?? []).map((item) => (
              <div key={item.id} className="flex gap-4 py-4">
                {item.thumbnail ? (
                  <Image
                    src={item.thumbnail}
                    alt=""
                    width={64}
                    height={80}
                    className="h-20 w-16 shrink-0 object-cover"
                  />
                ) : (
                  <div aria-hidden="true" className="h-20 w-16 shrink-0 bg-white/5" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{item.product_title ?? item.title}</div>
                  {item.variant_title && (
                    <div className="mt-0.5 text-sm text-paper/55">
                      {variantTitleLabel(item.variant_title)}
                    </div>
                  )}
                  <div className="mt-1 text-sm text-paper/55">Quantidade: {item.quantity}</div>
                </div>
                <div className="shrink-0 text-sm font-semibold">
                  {formatMoney(item.total ?? item.unit_price * item.quantity, moeda)}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 flex flex-col gap-2.5">
          {/* item_subtotal, não subtotal: no Medusa v2 o `subtotal` já vem com o
              frete embutido, e somar os dois na tela fazia a conta não fechar. */}
          <Linha rotulo="Subtotal" valor={formatMoney(order.item_subtotal ?? 0, moeda)} />
          <Linha rotulo="Frete" valor={formatMoney(order.shipping_total ?? 0, moeda)} />
          <div className="mt-2 border-t border-white/10 pt-3">
            <Linha rotulo="Total" valor={formatMoney(order.total, moeda)} forte />
          </div>
          {meioDePagamento && (
            <div className="mt-1 text-sm text-paper/55">Pago com {meioDePagamento}</div>
          )}
        </section>

        {endereco && (
          <section className="mt-12">
            <h2 className="mb-4 text-sm font-bold tracking-[0.1em] text-paper/70">ENTREGA</h2>
            <div className="text-sm leading-relaxed text-paper/75">
              {endereco.first_name} {endereco.last_name}
              <br />
              {endereco.address_1}
              {endereco.address_2 ? `, ${endereco.address_2}` : ""}
              <br />
              {endereco.city} {endereco.province ? `- ${endereco.province.toUpperCase()}` : ""}{" "}
              {endereco.postal_code}
              <br />
              {endereco.country_code?.toUpperCase()}
              {endereco.phone && (
                <>
                  <br />
                  {endereco.phone}
                </>
              )}
            </div>
          </section>
        )}

        {/* Cancelamento e troca ainda são feitos pelo atendimento: o caminho
            pela conta está descrito nas políticas e é o próximo passo. Até lá,
            mandar a pessoa pro e-mail é o que de fato resolve. */}
        <section className="mt-12 border border-white/15 p-5">
          <div className="mb-2 text-[12px] font-bold tracking-[0.14em] text-paper/70">
            PRECISA MUDAR ALGO NESTE PEDIDO?
          </div>
          <p className="text-sm leading-relaxed text-paper/60">
            Cancelamento, troca ou devolução: fala com a gente em{" "}
            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=Pedido %23${order.display_id}`}
              className="font-semibold text-paper underline underline-offset-4 hover:text-accent"
            >
              {SUPPORT_EMAIL}
            </a>{" "}
            com o número do pedido. As regras estão na{" "}
            <Link
              href="/institucional/cancelamentos"
              className="underline underline-offset-4 hover:text-accent"
            >
              Política de Cancelamentos
            </Link>{" "}
            e na{" "}
            <Link
              href="/institucional/trocas-e-devolucoes"
              className="underline underline-offset-4 hover:text-accent"
            >
              Política de Trocas e Devoluções
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
