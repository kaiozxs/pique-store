"use server";

import { revalidatePath } from "next/cache";
import { addLineItem, appliedPromoCodes, removeLineItem, setPromoCodes, updateLineItemQuantity } from "./cart";

export async function addToCartAction(
  variantId: string,
  quantity: number
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await addLineItem(variantId, quantity);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch {
    return { ok: false, error: "Não foi possível adicionar à sacola." };
  }
}

export async function updateCartItemAction(lineItemId: string, quantity: number): Promise<void> {
  if (quantity <= 0) {
    await removeLineItem(lineItemId);
  } else {
    await updateLineItemQuantity(lineItemId, quantity);
  }
  revalidatePath("/", "layout");
}

export async function removeCartItemAction(lineItemId: string): Promise<void> {
  await removeLineItem(lineItemId);
  revalidatePath("/", "layout");
}

export async function applyPromoAction(
  codigo: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const limpo = codigo.trim().toUpperCase();
  if (!limpo) return { ok: false, error: "Digite o código do cupom." };
  try {
    const atuais = await appliedPromoCodes();
    await setPromoCodes([...new Set([...atuais, limpo])]);
    // O Medusa ignora código inexistente sem erro: só vale se ele aparecer.
    if (!(await appliedPromoCodes()).includes(limpo)) {
      return { ok: false, error: "Cupom inválido, expirado ou não se aplica a esta sacola." };
    }
    revalidatePath("/", "layout");
    return { ok: true };
  } catch {
    return { ok: false, error: "Cupom inválido, expirado ou não se aplica a esta sacola." };
  }
}

export async function removePromoAction(codigo: string): Promise<void> {
  const atuais = await appliedPromoCodes();
  await setPromoCodes(atuais.filter((c) => c !== codigo));
  revalidatePath("/", "layout");
}
