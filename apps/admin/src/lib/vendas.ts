import "server-only";
import { createPiecesForOrder, db, idPessoal, listCustomerNames, listOrders, type Order } from "@pique/db";
import { exigirDono } from "./auth";
import { listPiecesByOrder } from "./etiquetas";
import type { PieceUnit } from "./pecas";

/** Pedido pago, com o nome de quem comprou (a conta, quando houver; senão o e-mail). */
export type Venda = Order & { cliente_nome: string };

export { idPessoal };

export function nomeDoCliente(v: Venda): string {
  return v.cliente_nome || v.email || "Cliente";
}

/** Intervalo em dias inteiros (YYYY-MM-DD, fuso de São Paulo), incluindo o último dia. Só pedidos pagos. */
export async function listVendas(inicio: string, fim: string): Promise<Venda[]> {
  await exigirDono();
  const { orders } = await listOrders(db(), { from: inicio, to: fim, paymentStatus: "captured", limit: 300 });
  const nomes = await listCustomerNames(
    db(),
    orders.flatMap((o) => (o.customer_id ? [o.customer_id] : []))
  );
  return orders.map((o) => ({ ...o, cliente_nome: (o.customer_id && nomes.get(o.customer_id)) || "" }));
}

/**
 * Garante que cada pedido pago tenha seus códigos. Normalmente já nascem no
 * pagamento aprovado; isto completa pedidos antigos. Nunca duplica: o banco só
 * gera se o pedido ainda não tem nenhuma peça.
 */
export async function garantirPecas(venda: Venda): Promise<PieceUnit[]> {
  await exigirDono();
  await db().begin((tx) => createPiecesForOrder(tx, venda.id));
  return listPiecesByOrder(venda.id);
}
