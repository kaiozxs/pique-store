import { notFound } from "next/navigation";
import { getOrder, formatMoney } from "@/lib/orders";

export default async function PedidoDetailPage({ params }: PageProps<"/pedidos/[id]">) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();

  const address = order.shipping_address;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-ink">Pedido #{order.display_id}</h1>
        <button
          type="button"
          disabled
          title="Aguardando definição de CNPJ e provedor de nota fiscal com o cliente"
          className="cursor-not-allowed rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-muted opacity-60"
        >
          Emitir NF
        </button>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted">Cliente</div>
          <div className="mt-1 text-sm text-ink">{order.email}</div>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted">Pagamento</div>
          <div className="mt-1 text-sm text-ink">{order.payment_status}</div>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted">Envio</div>
          <div className="mt-1 text-sm text-ink">{order.fulfillment_status}</div>
        </div>
      </div>

      <div className="mb-6 overflow-hidden rounded-lg border border-border bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg text-left text-xs font-semibold uppercase tracking-wide text-muted">
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Qtd.</th>
              <th className="px-4 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {(order.items ?? []).map((item) => (
              <tr key={item.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-ink">
                  {item.product_title}
                  {item.variant_title && <span className="text-muted"> — {item.variant_title}</span>}
                </td>
                <td className="px-4 py-3 text-muted">{item.quantity}</td>
                <td className="px-4 py-3 text-right text-ink">
                  {formatMoney(item.total, order.currency_code)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-border">
              <td colSpan={2} className="px-4 py-3 text-right font-semibold text-ink">
                Total do pedido
              </td>
              <td className="px-4 py-3 text-right font-bold text-ink">
                {formatMoney(order.total, order.currency_code)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {address && (
        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
            Endereço de entrega
          </div>
          <div className="text-sm text-ink">
            {address.address_1}
            {address.address_2 ? `, ${address.address_2}` : ""}
            <br />
            {address.city} — {address.province}, {address.postal_code}
            <br />
            {address.country_code?.toUpperCase()}
          </div>
        </div>
      )}
    </div>
  );
}
