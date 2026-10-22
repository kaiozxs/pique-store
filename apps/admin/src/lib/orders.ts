import "server-only";
import { db, getOrder as buscarPedido, listOrders as listarPedidos, setTracking, type Order } from "@pique/db";
import { exigirUsuario } from "./auth";

export type AdminOrder = Order;

export async function listOrders(params: { limit?: number; offset?: number } = {}) {
  await exigirUsuario();
  return listarPedidos(db(), { limit: params.limit ?? 20, offset: params.offset ?? 0 });
}

export async function getOrder(id: string): Promise<AdminOrder | null> {
  await exigirUsuario();
  try {
    return await buscarPedido(db(), id);
  } catch {
    // id que não é um uuid válido
    return null;
  }
}

export function formatMoney(amount: number, currencyCode: string): string {
  return amount.toLocaleString("pt-BR", { style: "currency", currency: currencyCode.toUpperCase() });
}

/**
 * Guarda o código de rastreio digitado pela operação. A integração com os
 * Correios ainda não existe: alguém do time cola o código que recebeu no
 * balcão e a loja passa a mostrar pro cliente. Informar um código também
 * marca o pedido como enviado.
 */
export async function saveTrackingCode(orderId: string, codigo: string): Promise<void> {
  await exigirUsuario();
  await setTracking(db(), orderId, codigo);
}
