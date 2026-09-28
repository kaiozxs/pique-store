import "server-only";
import type { HttpTypes } from "@medusajs/types";
import { sdk } from "./sdk";
import { authHeaders } from "./session";

export type AdminOrder = HttpTypes.AdminOrder;

const LIST_FIELDS = [
  "id",
  "display_id",
  "email",
  "status",
  "fulfillment_status",
  "payment_status",
  "total",
  "currency_code",
  "created_at",
].join(",");

export async function listOrders(params: { limit?: number; offset?: number } = {}) {
  const headers = await authHeaders();
  const { orders, count } = await sdk.admin.order.list(
    {
      limit: params.limit ?? 20,
      offset: params.offset ?? 0,
      order: "-created_at",
      fields: LIST_FIELDS,
    },
    headers
  );
  return { orders, count };
}

export async function getOrder(id: string): Promise<AdminOrder | null> {
  const headers = await authHeaders();
  try {
    const { order } = await sdk.admin.order.retrieve(
      id,
      {
        fields:
          "+display_id,+email,+status,+payment_status,+fulfillment_status,+total,+currency_code,+metadata,*items,*items.variant,*shipping_address,*billing_address,*customer,*summary,*payment_collections",
      },
      headers
    );
    return order;
  } catch {
    return null;
  }
}

export function formatMoney(amount: number, currencyCode: string): string {
  return amount.toLocaleString("pt-BR", { style: "currency", currency: currencyCode.toUpperCase() });
}

/**
 * Guarda o código de rastreio digitado pela operação.
 *
 * Fica no metadata do pedido, e não numa remessa do Medusa, porque a
 * integração com os Correios ainda não existe: aqui alguém do time cola o
 * código que recebeu no balcão, e a loja passa a mostrar pro cliente. Quando
 * a integração entrar, esse campo vira o valor de partida.
 *
 * Preserva o resto do metadata — CPF e data de nascimento da compra moram lá.
 */
export async function saveTrackingCode(orderId: string, codigo: string): Promise<void> {
  const headers = await authHeaders();
  const atual = await getOrder(orderId);
  const metadata = { ...(atual?.metadata ?? {}), tracking_numbers: codigo.trim() };
  await sdk.client.fetch(`/admin/orders/${orderId}`, {
    method: "POST",
    body: { metadata },
    headers,
  });
}
