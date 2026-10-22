"use server";

import { revalidatePath } from "next/cache";
import { addItem, applyCoupon, db, ErroDeRegra, removeCoupon, setItemQuantity } from "@pique/db";
import { getOrCreateCartId } from "./cart";
import { getCartId } from "./cart-session";

export type Resultado = { ok: true } | { ok: false; error: string };

function mensagem(e: unknown, padrao: string): string {
  return e instanceof ErroDeRegra ? e.message : padrao;
}

export async function addToCartAction(variantId: string, quantity: number): Promise<Resultado> {
  try {
    const cartId = await getOrCreateCartId();
    await addItem(db(), cartId, variantId, quantity);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: mensagem(e, "Não foi possível adicionar à sacola.") };
  }
}

export async function updateCartItemAction(lineItemId: string, quantity: number): Promise<Resultado> {
  try {
    const cartId = await getCartId();
    if (!cartId) return { ok: false, error: "Sua sacola está vazia." };
    await setItemQuantity(db(), cartId, lineItemId, quantity);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: mensagem(e, "Não foi possível atualizar a sacola.") };
  }
}

export async function removeCartItemAction(lineItemId: string): Promise<Resultado> {
  return updateCartItemAction(lineItemId, 0);
}

export async function applyPromoAction(codigo: string): Promise<Resultado> {
  try {
    const cartId = await getCartId();
    if (!cartId) return { ok: false, error: "Sua sacola está vazia." };
    await applyCoupon(db(), cartId, codigo);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: mensagem(e, "Cupom inválido, expirado ou não se aplica a esta sacola.") };
  }
}

export async function removePromoAction(): Promise<void> {
  const cartId = await getCartId();
  if (!cartId) return;
  await removeCoupon(db(), cartId);
  revalidatePath("/", "layout");
}
