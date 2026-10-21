import { ErroDeRegra, type Sql } from "./sql.ts";
import { getCart } from "./cart.ts";
import { createPiecesForOrder, revokePiecesOfOrder } from "./pieces.ts";
import type { Order } from "./types.ts";

const ISO = (coluna: string) => `to_char(${coluna} at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`;

const SELECT_PEDIDO = `
  select o.id, o.display_id, o.customer_id, o.email, o.shipping_address, o.document, o.subtotal, o.shipping_total,
         o.discount_total, o.total, o.currency_code, o.coupon_code, o.shipping_option_name, o.status, o.payment_status,
         o.fulfillment_status, o.tracking_code, o.metadata, ${ISO("o.created_at")} as created_at,
         ${ISO("o.paid_at")} as paid_at,
    coalesce((select json_agg(json_build_object('id', i.id, 'variant_id', i.variant_id, 'product_title', i.product_title,
                                                'variant_title', i.variant_title, 'thumbnail', i.thumbnail,
                                                'quantity', i.quantity, 'unit_price', i.unit_price, 'total', i.total)
                              order by i.id)
              from order_items i where i.order_id = o.id), '[]'::json) as items
  from orders o`;

export async function getOrder(sql: Sql, id: string, opts: { customerId?: string } = {}): Promise<Order | null> {
  const [o] = await sql.unsafe<Order>(`${SELECT_PEDIDO} where o.id = $1 and ($2::uuid is null or o.customer_id = $2)`, [
    id,
    opts.customerId ?? null,
  ]);
  return o ?? null;
}

/** Dia no fuso de São Paulo, como o painel mostra (`from`/`to` inclusivos, "YYYY-MM-DD"). */
export async function listOrders(
  sql: Sql,
  filtros: { customerId?: string; from?: string; to?: string; limit?: number; offset?: number } = {}
): Promise<{ orders: Order[]; count: number }> {
  const params = [filtros.customerId ?? null, filtros.from ?? null, filtros.to ?? null];
  const onde = `where ($1::uuid is null or o.customer_id = $1)
    and ($2::date is null or (o.created_at at time zone 'America/Sao_Paulo')::date >= $2::date)
    and ($3::date is null or (o.created_at at time zone 'America/Sao_Paulo')::date <= $3::date)`;
  const orders = await sql.unsafe<Order>(
    `${SELECT_PEDIDO} ${onde} order by o.created_at desc limit $4 offset $5`,
    [...params, filtros.limit ?? 50, filtros.offset ?? 0]
  );
  const [{ n }] = await sql.unsafe<{ n: number }>(`select count(*)::int as n from orders o ${onde}`, params) as [{ n: number }];
  return { orders, count: n };
}

// ───────── Compra ─────────

/**
 * Transforma a sacola em pedido e RESERVA o estoque, numa transação só.
 *
 * Reservar antes de cobrar é o que impede o pior caso: o cliente pagar uma
 * peça que acabou. Duas pessoas comprando a última unidade ao mesmo tempo: a
 * segunda recebe o aviso de esgotado e nada é cobrado. Se qualquer passo falha,
 * a transação inteira desfaz (estoque, cupom e pedido).
 */
export async function placeOrder(sql: Sql, input: { cartId: string; customerId: string | null }): Promise<Order> {
  return sql.begin(async (tx) => {
    const [aberto] = await tx<{ id: string }>`select id from carts where id = ${input.cartId} and completed_at is null for update`;
    if (!aberto) throw new ErroDeRegra("Sacola não encontrada ou já finalizada.", "carrinho");

    const cart = await getCart(tx, input.cartId);
    if (!cart || cart.items.length === 0) throw new ErroDeRegra("Sua sacola está vazia.", "carrinho");
    if (!cart.email) throw new ErroDeRegra("Informe seu e-mail.", "dados");
    if (!cart.shipping_address) throw new ErroDeRegra("Informe o endereço de entrega.", "dados");
    if (!cart.document) throw new ErroDeRegra("Informe CPF e data de nascimento.", "dados");
    if (!cart.shipping_option) throw new ErroDeRegra("Escolha a forma de envio.", "dados");

    if (cart.coupon) {
      const usado = await tx`update coupons set uses = uses + 1
                             where code = ${cart.coupon.code} and (max_uses is null or uses < max_uses) returning code`;
      if (usado.length === 0) throw new ErroDeRegra("O cupom não está mais disponível.", "cupom");
    }

    // Ordem fixa por variação: duas compras com as mesmas peças nunca travam uma à outra.
    const reservado = new Map<string, number>();
    for (const item of [...cart.items].sort((a, b) => a.variant_id.localeCompare(b.variant_id))) {
      if (item.allow_backorder) {
        reservado.set(item.variant_id, 0);
        continue;
      }
      const ok = await tx`
        update variants set stock = stock - ${item.quantity}
        where id = ${item.variant_id} and active and stock >= ${item.quantity}
          and exists (select 1 from products p where p.id = variants.product_id and p.status = 'published')
        returning id`;
      if (ok.length === 0) {
        throw new ErroDeRegra(`"${item.product_title}" (${item.variant_title}) esgotou enquanto você comprava.`, "estoque");
      }
      reservado.set(item.variant_id, item.quantity);
    }

    const dono = input.customerId ?? cart.customer_id;
    const [pedido] = await tx<{ id: string }>`
      insert into orders (customer_id, email, shipping_address, document, subtotal, shipping_total, discount_total, total,
                          currency_code, coupon_code, shipping_option_name)
      values (${dono}, ${cart.email}, ${JSON.stringify(cart.shipping_address)}::jsonb, ${JSON.stringify(cart.document)}::jsonb,
              ${cart.subtotal}, ${cart.shipping_total}, ${cart.discount_total}, ${cart.total}, ${cart.currency_code},
              ${cart.coupon?.code ?? null}, ${cart.shipping_option.name})
      returning id`;

    for (const item of cart.items) {
      await tx`
        insert into order_items (order_id, variant_id, product_title, variant_title, thumbnail, quantity, unit_price, total, stock_reserved)
        values (${pedido!.id}, ${item.variant_id}, ${item.product_title}, ${item.variant_title}, ${item.thumbnail},
                ${item.quantity}, ${item.unit_price}, ${item.total}, ${reservado.get(item.variant_id) ?? 0})`;
    }
    await tx`update carts set completed_at = now() where id = ${input.cartId}`;

    return (await getOrder(tx, pedido!.id))!;
  });
}

// ───────── Estoque e cupom do pedido ─────────

/** Devolve ao estoque o que o pedido reservou — uma única vez, mesmo se chamado de novo. */
async function liberarReservas(tx: Sql, orderId: string): Promise<void> {
  const [liberado] = await tx<{ coupon_code: string | null }>`
    update orders set stock_released = true where id = ${orderId} and not stock_released returning coupon_code`;
  if (!liberado) return;
  await tx`
    update variants v set stock = v.stock + oi.stock_reserved
    from order_items oi
    where oi.order_id = ${orderId} and oi.variant_id = v.id and oi.stock_reserved > 0`;
  if (liberado.coupon_code) {
    await tx`update coupons set uses = greatest(uses - 1, 0) where code = ${liberado.coupon_code}`;
  }
}

/** Reserva de novo o estoque de um pedido cancelado que acabou sendo pago (aviso atrasado). */
async function reservarDeNovo(tx: Sql, orderId: string): Promise<boolean> {
  const itens = await tx<{ id: string; variant_id: string | null; quantity: number; stock_reserved: number }>`
    select id, variant_id, quantity, stock_reserved from order_items where order_id = ${orderId} order by variant_id`;
  // Só tenta se este pedido tinha devolvido peças; sob encomenda nunca reservou.
  const precisa = itens.filter((i) => i.variant_id && i.stock_reserved > 0);
  for (const i of precisa) {
    const ok = await tx`update variants set stock = stock - ${i.stock_reserved}
                        where id = ${i.variant_id} and stock >= ${i.stock_reserved} returning id`;
    if (ok.length === 0) return false; // a transação do chamador desfaz as já tomadas
  }
  await tx`update orders set stock_released = false where id = ${orderId}`;
  return true;
}

// ───────── Pagamento ─────────

export type StatusMercadoPago =
  | "approved"
  | "authorized"
  | "in_process"
  | "pending"
  | "rejected"
  | "cancelled"
  | "expired"
  | "refunded"
  | "charged_back";

/**
 * Registra o resultado de um pagamento e move o pedido de acordo. É chamado
 * tanto na hora da compra quanto pelo aviso (webhook) do Mercado Pago, que pode
 * chegar repetido ou fora de ordem: por isso é idempotente.
 *
 *  - aprovado → pedido pago; gera os códigos das peças (uma vez);
 *  - recusado/cancelado/vencido → pedido cai e o estoque volta (uma vez);
 *  - reembolsado/estornado → pedido cai, as peças perdem a autenticidade;
 *  - pendente/em análise → nada muda (continua aguardando).
 */
export async function applyPaymentResult(
  sql: Sql,
  input: {
    orderId: string;
    providerPaymentId: string;
    status: StatusMercadoPago | string;
    statusDetail?: string | null;
    amount: number;
    raw?: unknown;
  }
): Promise<Order> {
  return sql.begin(async (tx) => {
    const [pedido] = await tx<{
      id: string;
      status: string;
      payment_status: string;
      fulfillment_status: string;
    }>`select id, status, payment_status, fulfillment_status from orders where id = ${input.orderId} for update`;
    if (!pedido) throw new ErroDeRegra("Pedido não encontrado.");

    const [outro] = await tx<{ order_id: string }>`
      select order_id from payments where provider_payment_id = ${input.providerPaymentId}`;
    if (outro && outro.order_id !== pedido.id) throw new ErroDeRegra("Este pagamento pertence a outro pedido.");

    await tx`
      insert into payments (order_id, provider_payment_id, status, status_detail, amount, raw)
      values (${pedido.id}, ${input.providerPaymentId}, ${input.status}, ${input.statusDetail ?? null}, ${input.amount},
              ${input.raw === undefined ? null : JSON.stringify(input.raw)}::jsonb)
      on conflict (provider_payment_id) do update
        set status = excluded.status, status_detail = excluded.status_detail, raw = excluded.raw, updated_at = now()`;

    switch (input.status) {
      case "approved": {
        if (pedido.payment_status === "captured") break; // aviso repetido
        if (pedido.status === "canceled") {
          // Pago depois de cancelado (aviso atrasado): só revive se ainda há estoque.
          const reservou = await reservarDeNovo(tx, pedido.id);
          if (!reservou) {
            await tx`update orders set payment_status = 'captured', paid_at = now(), updated_at = now(),
                            metadata = metadata || '{"precisa_reembolso": true}'::jsonb where id = ${pedido.id}`;
            break;
          }
        }
        await tx`update orders set status = 'completed', payment_status = 'captured', paid_at = now(), updated_at = now()
                 where id = ${pedido.id}`;
        await createPiecesForOrder(tx, pedido.id);
        break;
      }
      case "rejected":
      case "cancelled":
      case "expired": {
        if (pedido.payment_status === "captured") break; // já pago: ignora aviso de outra tentativa
        await tx`update orders set status = 'canceled', payment_status = 'canceled', updated_at = now() where id = ${pedido.id}`;
        await liberarReservas(tx, pedido.id);
        break;
      }
      case "refunded":
      case "charged_back": {
        await tx`update orders set status = 'canceled', payment_status = 'refunded', updated_at = now() where id = ${pedido.id}`;
        // Peça já despachada não volta para a prateleira.
        if (pedido.fulfillment_status === "not_fulfilled") await liberarReservas(tx, pedido.id);
        await revokePiecesOfOrder(tx, pedido.id);
        break;
      }
      default:
        break; // pending, in_process, authorized: segue aguardando
    }
    return (await getOrder(tx, pedido.id))!;
  });
}

/** Pedidos que ficaram aguardando pagamento além do prazo: caem e devolvem o estoque. */
export async function cancelStalePendingOrders(sql: Sql, maxMinutos = 60): Promise<number> {
  return sql.begin(async (tx) => {
    const velhos = await tx<{ id: string }>`
      select id from orders
      where status = 'pending' and payment_status = 'awaiting'
        and created_at < now() - (${maxMinutos} * interval '1 minute')
      for update skip locked`;
    for (const o of velhos) {
      await tx`update orders set status = 'canceled', payment_status = 'canceled', updated_at = now() where id = ${o.id}`;
      await liberarReservas(tx, o.id);
    }
    return velhos.length;
  });
}

// ───────── Painel ─────────

export async function setTracking(sql: Sql, orderId: string, codigo: string): Promise<void> {
  const code = codigo.trim();
  await sql`
    update orders set tracking_code = ${code === "" ? null : code},
           fulfillment_status = case when ${code} <> '' and fulfillment_status = 'not_fulfilled' then 'shipped' else fulfillment_status end,
           updated_at = now()
    where id = ${orderId}`;
}

export async function setFulfillmentStatus(
  sql: Sql,
  orderId: string,
  status: "not_fulfilled" | "shipped" | "delivered"
): Promise<void> {
  await sql`update orders set fulfillment_status = ${status}, updated_at = now() where id = ${orderId}`;
}

export type SalesMetrics = {
  total_revenue: number;
  order_count: number;
  average_order_value: number;
  revenue_by_day: { date: string; total: number }[];
  start_date: string;
  end_date: string;
  currency_code: string;
};

/** Faturamento só de pedidos pagos, por dia, no fuso de São Paulo. */
export async function salesMetrics(sql: Sql, range: { from: string; to: string }): Promise<SalesMetrics> {
  const porDia = await sql<{ date: string; total: number }>`
    select to_char(d, 'YYYY-MM-DD') as date,
           coalesce((select sum(o.total) from orders o
                     where o.payment_status = 'captured'
                       and (o.created_at at time zone 'America/Sao_Paulo')::date = d), 0)::numeric(12,2) as total
    from generate_series(${range.from}::date, ${range.to}::date, interval '1 day') as d
    order by d`;
  const [r] = await sql<{ n: number; soma: number }>`
    select count(*)::int as n, coalesce(sum(total), 0)::numeric(12,2) as soma from orders
    where payment_status = 'captured'
      and (created_at at time zone 'America/Sao_Paulo')::date between ${range.from}::date and ${range.to}::date`;
  const n = r?.n ?? 0;
  const soma = r?.soma ?? 0;
  return {
    total_revenue: soma,
    order_count: n,
    average_order_value: n > 0 ? Math.round((soma / n) * 100) / 100 : 0,
    revenue_by_day: porDia.map((x) => ({ date: x.date, total: x.total })),
    start_date: range.from,
    end_date: range.to,
    currency_code: "brl",
  };
}
