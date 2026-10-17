import "server-only";
import type { HttpTypes } from "@medusajs/types";
import { sdk } from "./sdk";
import { getDefaultRegion } from "./medusa";
import { clearCartId, getCartId, setCartId } from "./cart-session";

export type MedusaCart = HttpTypes.StoreCart;

const CART_FIELDS = [
  "*items",
  "*items.variant",
  "*items.product",
  "*region",
  "*shipping_address",
  "*shipping_methods",
  "*shipping_methods.shipping_option",
  "*promotions",
  "*payment_collection",
  "+email",
  "+discount_total",
].join(",");

async function createCart(): Promise<MedusaCart> {
  const region = await getDefaultRegion();
  const { cart } = await sdk.store.cart.create({ region_id: region.id });
  await setCartId(cart.id);
  return cart;
}

export async function getCart(): Promise<MedusaCart | null> {
  const cartId = await getCartId();
  if (!cartId) return null;
  try {
    const { cart } = await sdk.store.cart.retrieve(cartId, { fields: CART_FIELDS });
    if (cart.completed_at) return null;
    return cart;
  } catch {
    await clearCartId();
    return null;
  }
}

export async function getOrCreateCart(): Promise<MedusaCart> {
  const existing = await getCart();
  if (existing) return existing;
  return createCart();
}

/**
 * Adiciona direto no carrinho do cookie, sem ler o carrinho inteiro antes —
 * essa leitura custava quase 1s a cada clique. Só quando a adição falha é que
 * se confere se o carrinho ainda vale: se ele sumiu ou já virou pedido, abre
 * outro; se vale, o erro é de verdade (estoque, por exemplo) e sobe.
 */
export async function addLineItem(variantId: string, quantity: number): Promise<void> {
  const body = { variant_id: variantId, quantity };
  const cartId = await getCartId();

  if (cartId) {
    try {
      await sdk.store.cart.createLineItem(cartId, body, { fields: "id" });
      return;
    } catch (erro) {
      const valido = await sdk.store.cart
        .retrieve(cartId, { fields: "id,completed_at" })
        .then(({ cart }) => !cart.completed_at)
        .catch(() => false);
      if (valido) throw erro;
    }
  }

  const novo = await createCart();
  await sdk.store.cart.createLineItem(novo.id, body, { fields: "id" });
}

export async function updateLineItemQuantity(lineItemId: string, quantity: number): Promise<MedusaCart> {
  const cart = await getOrCreateCart();
  const { cart: updated } = await sdk.store.cart.updateLineItem(cart.id, lineItemId, { quantity });
  return updated;
}

export async function removeLineItem(lineItemId: string): Promise<MedusaCart> {
  const cart = await getOrCreateCart();
  await sdk.store.cart.deleteLineItem(cart.id, lineItemId);
  const { cart: updated } = await sdk.store.cart.retrieve(cart.id, { fields: CART_FIELDS });
  return updated;
}

/**
 * Cupom: o código fica no próprio carrinho, no servidor — por isso sobrevive
 * a fechar o navegador junto com a sacola, sem precisar de cookie próprio.
 */
export async function setPromoCodes(codes: string[]): Promise<void> {
  const cart = await getOrCreateCart();
  await sdk.store.cart.update(cart.id, { promo_codes: codes });
}

export async function appliedPromoCodes(): Promise<string[]> {
  const cart = await getCart();
  return (cart?.promotions ?? []).map((p) => p.code).filter((c): c is string => Boolean(c));
}
