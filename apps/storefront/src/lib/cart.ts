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

export async function getCartItemCount(): Promise<number> {
  const cart = await getCart();
  if (!cart) return 0;
  return (cart.items ?? []).reduce((sum, item) => sum + item.quantity, 0);
}

export async function addLineItem(variantId: string, quantity: number): Promise<MedusaCart> {
  const cart = await getOrCreateCart();
  const { cart: updated } = await sdk.store.cart.createLineItem(cart.id, {
    variant_id: variantId,
    quantity,
  });
  return updated;
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
