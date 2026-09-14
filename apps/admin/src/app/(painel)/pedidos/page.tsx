import Link from "next/link";
import { listOrders, formatMoney } from "@/lib/orders";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  completed: "Concluído",
  canceled: "Cancelado",
  archived: "Arquivado",
  requires_action: "Requer ação",
};

const FULFILLMENT_LABEL: Record<string, string> = {
  not_fulfilled: "Não enviado",
  fulfilled: "Enviado",
  partially_fulfilled: "Parcialmente enviado",
  shipped: "A caminho",
  delivered: "Entregue",
  canceled: "Cancelado",
};

export default async function PedidosPage({ searchParams }: PageProps<"/pedidos">) {
  const params = await searchParams;
  const page = Number(params.page ?? 1) || 1;
  const limit = 20;
  const { orders, count } = await listOrders({ limit, offset: (page - 1) * limit });
  const totalPages = Math.max(1, Math.ceil(count / limit));

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-ink">Pedidos</h1>

      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg text-left text-xs font-semibold uppercase tracking-wide text-muted">
              <th className="px-4 py-3">Pedido</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Pagamento</th>
              <th className="px-4 py-3">Envio</th>
              <th className="px-4 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted">
                  Nenhum pedido ainda.
                </td>
              </tr>
            )}
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-border last:border-0 hover:bg-bg">
                <td className="px-4 py-3">
                  <Link href={`/pedidos/${order.id}`} className="font-semibold text-accent hover:underline">
                    #{order.display_id}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink">{order.email}</td>
                <td className="px-4 py-3 text-muted">
                  {new Date(order.created_at).toLocaleDateString("pt-BR")}
                </td>
                <td className="px-4 py-3 text-muted">
                  {STATUS_LABEL[order.payment_status] ?? order.payment_status}
                </td>
                <td className="px-4 py-3 text-muted">
                  {FULFILLMENT_LABEL[order.fulfillment_status] ?? order.fulfillment_status}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-ink">
                  {formatMoney(order.total, order.currency_code)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/pedidos?page=${p}`}
              className={`rounded-md px-3 py-1 ${
                p === page ? "bg-accent text-white" : "text-muted hover:bg-surface"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
