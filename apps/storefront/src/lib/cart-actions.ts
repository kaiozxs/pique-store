"use server";

import { revalidatePath } from "next/cache";
import { addLineItem, removeLineItem, updateLineItemQuantity } from "./cart";

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
