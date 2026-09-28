import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentCustomer, listCustomerOrders } from "@/lib/customer";
import { formatMoney } from "@/lib/medusa";
import { statusDoPedido } from "@/lib/order-status";
import { ContaShell, ContaVazio } from "@/components/conta/ContaShell";

export const metadata: Metadata = { title: "Meus pedidos — PIQUE" };

// Os filtros que o cliente entende, cada um agrupando as etapas internas que
// significam a mesma coisa pra quem comprou.
const FILTROS = [
  { chave: "todos", label: "TODOS" },
  { chave: "processando", label: "EM PROCESSAMENTO" },
  { chave: "enviados", label: "ENVIADOS" },
  { chave: "concluidos", label: "CONCLUÍDOS" },
] as const;

type Filtro = (typeof FILTROS)[number]["chave"];

export default async function PedidosPage(props: PageProps<"/conta/pedidos">) {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/conta");

  const { filtro } = await props.searchParams;
  const ativo: Filtro = FILTROS.some((f) => f.chave === filtro) ? (filtro as Filtro) : "todos";

  const todos = await listCustomerOrders();
  const pedidos = todos.filter((order) => {
    if (ativo === "todos") return true;
    const status = statusDoPedido(order);
    if (ativo === "processando") return !status.excecao && (status.etapa ?? 0) <= 3;
    if (ativo === "enviados") return !status.excecao && status.etapa === 4 && status.rotulo !== "Entregue";
    return status.rotulo === "Entregue" || status.excecao;
  });

  return (
    <ContaShell titulo="Meus pedidos" descricao="Todo o histórico das suas compras, com o acompanhamento de cada uma.">
      <div className="mb-7 flex flex-wrap gap-2">
        {FILTROS.map((f) => {
          const selecionado = f.chave === ativo;
          return (
            <Link
              key={f.chave}
              href={f.chave === "todos" ? "/conta/pedidos" : `/conta/pedidos?filtro=${f.chave}`}
              className={`border px-4 py-2 text-[11px] font-bold tracking-[0.1em] transition-colors ${
                selecionado
                  ? "border-accent bg-accent text-paper"
                  : "border-white/20 text-paper/55 hover:border-white/45 hover:text-paper"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {pedidos.length === 0 ? (
        <ContaVazio
          texto={
            todos.length === 0
              ? "Você ainda não fez nenhum pedido."
              : "Nenhum pedido nesse filtro."
          }
          botao={todos.length === 0 ? { href: "/drops", label: "VER O CATÁLOGO" } : undefined}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {pedidos.map((order) => {
            const status = statusDoPedido(order);
            return (
              <Link
                key={order.id}
                href={`/conta/pedidos/${order.id}`}
                className="group flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border border-white/12 px-5 py-4 transition-colors hover:border-white/30"
              >
                <div>
                  <div className="text-sm font-semibold">Pedido #{order.display_id}</div>
                  <div className="mt-0.5 text-xs text-paper/45">
                    {new Date(order.created_at).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-2 text-sm ${
                    status.excecao ? "text-paper/45" : "text-paper/75"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`h-1.5 w-1.5 rounded-full ${status.excecao ? "bg-paper/30" : "bg-accent"}`}
                  />
                  {status.rotulo}
                </span>

                <span className="flex items-center gap-3 text-sm font-semibold">
                  {formatMoney(order.total, order.currency_code)}
                  <span
                    aria-hidden="true"
                    className="text-paper/30 transition-all group-hover:translate-x-0.5 group-hover:text-accent"
                  >
                    →
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </ContaShell>
  );
}
