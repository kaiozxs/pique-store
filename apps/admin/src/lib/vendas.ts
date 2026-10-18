import "server-only";
import type { HttpTypes } from "@medusajs/types";
import { sdk } from "./sdk";
import { authHeaders } from "./session";
import { listPiecesByOrder } from "./etiquetas";
import type { PieceUnit } from "./pecas";

export type Venda = HttpTypes.AdminOrder;

/** Mesmo ID pessoal que o cliente vê na conta e que aparece na verificação. */
export function idPessoal(customerId: string): string {
  return `PQ-${customerId.replace(/^cus_/i, "").slice(-8).toUpperCase()}`;
}

export function nomeDoCliente(v: Venda): string {
  const c = v.customer;
  const nome = [c?.first_name, c?.last_name].filter(Boolean).join(" ");
  return nome || v.email || "Cliente";
}

/** Intervalo em dias inteiros (YYYY-MM-DD), incluindo o último dia. */
export async function listVendas(inicio: string, fim: string): Promise<Venda[]> {
  const headers = await authHeaders();
  const ate = new Date(`${fim}T00:00:00`);
  ate.setDate(ate.getDate() + 1);
  const { orders } = await sdk.admin.order.list(
    {
      limit: 300,
      order: "-created_at",
      created_at: { $gte: `${inicio}T00:00:00`, $lt: ate.toISOString().slice(0, 10) + "T00:00:00" },
      fields:
        "id,display_id,created_at,email,total,currency_code,customer_id,*customer,items.variant_id,items.quantity,items.product_title,items.variant_title",
    } as HttpTypes.AdminOrderFilters,
    headers
  );
  return orders;
}

/**
 * O backend no ar entende o filtro por pedido? Versões antigas ignoram o
 * filtro (devolvem todas as peças) e descartam dono/pedido ao criar — gerar
 * códigos com elas criaria peças soltas a cada clique. Pergunta por um pedido
 * que não existe: a versão nova responde vazio.
 */
export async function backendAtualizado(): Promise<boolean> {
  const headers = await authHeaders();
  const { piece_units } = await sdk.client.fetch<{ piece_units: PieceUnit[] }>("/admin/pecas", {
    headers,
    query: { order_id: "order_inexistente_verificacao" },
    cache: "no-store",
  });
  return piece_units.length === 0;
}

/**
 * Garante que cada unidade vendida tenha seu código. Normalmente o backend já
 * gera na hora da compra; aqui só completa o que faltar (pedidos antigos, ou
 * se a geração automática falhou). Nunca cria em dobro: compara a quantidade
 * vendida de cada variante com os códigos que o pedido já tem.
 */
export async function garantirPecas(venda: Venda): Promise<PieceUnit[]> {
  const headers = await authHeaders();
  const existentes = (await listPiecesByOrder(venda.id)).filter((p) => p.order_id === venda.id);

  const temPorVariante = new Map<string, number>();
  for (const p of existentes) temPorVariante.set(p.product_variant_id, (temPorVariante.get(p.product_variant_id) ?? 0) + 1);

  let criou = false;
  for (const item of venda.items ?? []) {
    if (!item.variant_id) continue;
    const vendido = Number(item.quantity ?? 0);
    const tem = temPorVariante.get(item.variant_id) ?? 0;
    const falta = vendido - tem;
    temPorVariante.set(item.variant_id, Math.max(0, tem - vendido));
    if (falta <= 0) continue;
    await sdk.client.fetch("/admin/pecas", {
      method: "POST",
      headers,
      body: {
        product_variant_id: item.variant_id,
        quantity: falta,
        ...(venda.customer_id ? { customer_id: venda.customer_id } : {}),
        order_id: venda.id,
      },
    });
    criou = true;
  }
  return criou ? (await listPiecesByOrder(venda.id)).filter((p) => p.order_id === venda.id) : existentes;
}
