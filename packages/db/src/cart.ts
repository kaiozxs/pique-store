import { ErroDeRegra, type Sql } from "./sql.ts";
import { getVariant } from "./catalog.ts";
import { calcularDesconto, calcularTotais, motivoDoCupomInvalido, type CupomRegras } from "./pricing.ts";
import type { AddressInput, Cart, CartItem, ShippingOption } from "./types.ts";

export async function listShippingOptions(sql: Sql): Promise<ShippingOption[]> {
  return sql<ShippingOption>`select id, name, price, estimate from shipping_options where active order by position, name`;
}

export async function createCart(sql: Sql, customerId: string | null = null): Promise<string> {
  const [c] = await sql<{ id: string }>`insert into carts (customer_id) values (${customerId}) returning id`;
  return c!.id;
}

type LinhaCarrinho = {
  id: string;
  customer_id: string | null;
  email: string | null;
  shipping_address: AddressInput | null;
  document: { cpf: string; birth_date: string } | null;
  shipping_option_id: string | null;
  so_name: string | null;
  so_price: number | null;
  so_estimate: string | null;
  coupon_code: string | null;
} & Partial<{
  cp_kind: "percent" | "fixed";
  cp_amount: number;
  cp_min_subtotal: number;
  cp_starts_at: string | null;
  cp_ends_at: string | null;
  cp_max_uses: number | null;
  cp_uses: number;
  cp_active: boolean;
}>;

/**
 * O carrinho com tudo calculado no servidor. O preço vem SEMPRE da variação no
 * banco, nunca do navegador: quem mexe no HTML não muda o valor cobrado.
 * Carrinho já concluído (virou pedido) não existe mais: devolve null.
 */
export async function getCart(sql: Sql, cartId: string): Promise<Cart | null> {
  const [c] = await sql<LinhaCarrinho>`
    select c.id, c.customer_id, c.email, c.shipping_address, c.document, c.shipping_option_id, c.coupon_code,
           so.name as so_name, so.price as so_price, so.estimate as so_estimate,
           cp.kind as cp_kind, cp.amount as cp_amount, cp.min_subtotal as cp_min_subtotal,
           cp.starts_at as cp_starts_at, cp.ends_at as cp_ends_at, cp.max_uses as cp_max_uses,
           cp.uses as cp_uses, cp.active as cp_active
    from carts c
    left join shipping_options so on so.id = c.shipping_option_id
    left join coupons cp on cp.code = c.coupon_code
    where c.id = ${cartId} and c.completed_at is null`;
  if (!c) return null;

  const itens = await sql<Omit<CartItem, "total">>`
    select ci.id, ci.variant_id, v.product_id, p.handle, p.title as product_title, v.title as variant_title,
           p.thumbnail, v.options, ci.quantity, v.price as unit_price, v.stock, v.allow_backorder
    from cart_items ci
    join variants v on v.id = ci.variant_id
    join products p on p.id = v.product_id
    where ci.cart_id = ${cartId}
    order by ci.created_at, ci.id`;

  const items: CartItem[] = itens.map((i) => ({ ...i, total: Math.round(i.unit_price * i.quantity * 100) / 100 }));
  const subtotalBruto = items.reduce((n, i) => n + i.total, 0);

  let coupon: Cart["coupon"] = null;
  let desconto = 0;
  if (c.coupon_code && c.cp_kind) {
    const regras: CupomRegras = {
      kind: c.cp_kind,
      amount: c.cp_amount!,
      min_subtotal: c.cp_min_subtotal ?? 0,
      starts_at: c.cp_starts_at ?? null,
      ends_at: c.cp_ends_at ?? null,
      max_uses: c.cp_max_uses ?? null,
      uses: c.cp_uses ?? 0,
      active: c.cp_active ?? false,
    };
    // Cupom que deixou de valer (venceu, acabou…) simplesmente para de abater.
    if (!motivoDoCupomInvalido(regras, subtotalBruto)) {
      coupon = { code: c.coupon_code, kind: regras.kind, amount: regras.amount };
      desconto = calcularDesconto(regras, subtotalBruto);
    }
  }

  const shipping_option: ShippingOption | null = c.shipping_option_id
    ? { id: c.shipping_option_id, name: c.so_name!, price: c.so_price!, estimate: c.so_estimate }
    : null;
  const totais = calcularTotais({ subtotal: subtotalBruto, frete: items.length > 0 ? (shipping_option?.price ?? 0) : 0, desconto });

  return {
    id: c.id,
    customer_id: c.customer_id,
    email: c.email,
    shipping_address: c.shipping_address,
    document: c.document,
    shipping_option,
    coupon,
    items,
    item_count: items.reduce((n, i) => n + i.quantity, 0),
    subtotal: totais.subtotal,
    shipping_total: totais.frete,
    discount_total: totais.desconto,
    total: totais.total,
    currency_code: "brl",
  };
}

async function carrinhoAberto(tx: Sql, cartId: string) {
  const [c] = await tx<{ id: string }>`select id from carts where id = ${cartId} and completed_at is null for update`;
  if (!c) throw new ErroDeRegra("Sacola não encontrada.", "carrinho");
}

function validarEstoque(v: { stock: number; allow_backorder: boolean }, quantidade: number) {
  if (v.allow_backorder) return;
  if (v.stock === 0) throw new ErroDeRegra("Essa peça está esgotada.", "estoque");
  if (quantidade > v.stock) {
    throw new ErroDeRegra(`Só restam ${v.stock} unidade${v.stock === 1 ? "" : "s"} dessa peça.`, "estoque");
  }
}

export async function addItem(sql: Sql, cartId: string, variantId: string, quantidade: number): Promise<void> {
  if (!Number.isInteger(quantidade) || quantidade < 1) throw new ErroDeRegra("Quantidade inválida.");
  await sql.begin(async (tx) => {
    await carrinhoAberto(tx, cartId);
    const v = await getVariant(tx, variantId);
    if (!v || !v.active || !v.published) throw new ErroDeRegra("Essa peça não está disponível.", "indisponivel");

    const [atual] = await tx<{ quantity: number }>`
      select quantity from cart_items where cart_id = ${cartId} and variant_id = ${variantId}`;
    const nova = (atual?.quantity ?? 0) + quantidade;
    validarEstoque(v, nova);

    await tx`insert into cart_items (cart_id, variant_id, quantity) values (${cartId}, ${variantId}, ${nova})
             on conflict (cart_id, variant_id) do update set quantity = excluded.quantity`;
    await tx`update carts set updated_at = now() where id = ${cartId}`;
  });
}

/** Quantidade 0 ou menos remove o item. */
export async function setItemQuantity(sql: Sql, cartId: string, itemId: string, quantidade: number): Promise<void> {
  await sql.begin(async (tx) => {
    await carrinhoAberto(tx, cartId);
    if (quantidade <= 0) {
      await tx`delete from cart_items where id = ${itemId} and cart_id = ${cartId}`;
    } else {
      const [item] = await tx<{ variant_id: string }>`select variant_id from cart_items where id = ${itemId} and cart_id = ${cartId}`;
      if (!item) throw new ErroDeRegra("Item não encontrado na sacola.");
      const v = await getVariant(tx, item.variant_id);
      if (!v || !v.active || !v.published) throw new ErroDeRegra("Essa peça não está disponível.", "indisponivel");
      validarEstoque(v, quantidade);
      await tx`update cart_items set quantity = ${quantidade} where id = ${itemId} and cart_id = ${cartId}`;
    }
    await tx`update carts set updated_at = now() where id = ${cartId}`;
  });
}

export async function removeItem(sql: Sql, cartId: string, itemId: string): Promise<void> {
  await setItemQuantity(sql, cartId, itemId, 0);
}

export async function setCheckoutInfo(
  sql: Sql,
  cartId: string,
  info: { email: string; address: AddressInput; document: { cpf: string; birth_date: string } }
): Promise<void> {
  const email = info.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ErroDeRegra("Informe um e-mail válido.");
  const r = await sql`
    update carts set email = ${email}, shipping_address = ${JSON.stringify(info.address)}::jsonb,
           document = ${JSON.stringify(info.document)}::jsonb, updated_at = now()
    where id = ${cartId} and completed_at is null returning id`;
  if (r.length === 0) throw new ErroDeRegra("Sacola não encontrada.", "carrinho");
}

export async function setShippingOption(sql: Sql, cartId: string, optionId: string): Promise<void> {
  const [o] = await sql<{ id: string }>`select id from shipping_options where id = ${optionId} and active`;
  if (!o) throw new ErroDeRegra("Essa forma de envio não está disponível.");
  const r = await sql`update carts set shipping_option_id = ${optionId}, updated_at = now()
                      where id = ${cartId} and completed_at is null returning id`;
  if (r.length === 0) throw new ErroDeRegra("Sacola não encontrada.", "carrinho");
}

export async function applyCoupon(sql: Sql, cartId: string, codigo: string): Promise<void> {
  const code = codigo.trim().toUpperCase();
  const invalido = new ErroDeRegra("Cupom inválido, expirado ou não se aplica a esta sacola.", "cupom");
  if (!code) throw new ErroDeRegra("Digite o código do cupom.", "cupom");

  const cart = await getCart(sql, cartId);
  if (!cart) throw new ErroDeRegra("Sacola não encontrada.", "carrinho");

  const [cp] = await sql<CupomRegras>`
    select kind, amount, min_subtotal, starts_at, ends_at, max_uses, uses, active from coupons where code = ${code}`;
  if (!cp || motivoDoCupomInvalido(cp, cart.items.reduce((n, i) => n + i.total, 0))) throw invalido;

  await sql`update carts set coupon_code = ${code}, updated_at = now() where id = ${cartId}`;
}

export async function removeCoupon(sql: Sql, cartId: string): Promise<void> {
  await sql`update carts set coupon_code = null, updated_at = now() where id = ${cartId} and completed_at is null`;
}

/** Passa a sacola para a conta de quem acabou de entrar (a sacola nunca troca de dono). */
export async function assignToCustomer(sql: Sql, cartId: string, customerId: string): Promise<void> {
  await sql`update carts set customer_id = ${customerId}, updated_at = now()
            where id = ${cartId} and completed_at is null and (customer_id is null or customer_id = ${customerId})`;
}

/** A sacola aberta mais recente de uma conta — é o que volta quando a pessoa entra em outro aparelho. */
export async function findOpenCartForCustomer(sql: Sql, customerId: string): Promise<string | null> {
  const [c] = await sql<{ id: string }>`
    select c.id from carts c
    where c.customer_id = ${customerId} and c.completed_at is null
      and exists (select 1 from cart_items ci where ci.cart_id = c.id)
    order by c.updated_at desc limit 1`;
  return c?.id ?? null;
}
