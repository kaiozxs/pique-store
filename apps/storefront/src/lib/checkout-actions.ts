"use server";

import { revalidatePath } from "next/cache";
import {
  completeCheckout,
  ensureMercadoPagoSession,
  listShippingOptions,
  selectShippingOption,
  setCheckoutAddress,
  submitMercadoPagoPaymentData,
  type CheckoutDocumentInput,
  type MercadoPagoBrickData,
  type ShippingAddressInput,
} from "./checkout";

export async function saveAddressAction(
  email: string,
  address: ShippingAddressInput,
  document: CheckoutDocumentInput
) {
  const cart = await setCheckoutAddress(email, address, document);
  return cart;
}

export async function getShippingOptionsAction() {
  return listShippingOptions();
}

export async function selectShippingOptionAction(optionId: string) {
  return selectShippingOption(optionId);
}

export async function initiateMercadoPagoSessionAction() {
  const cart = await ensureMercadoPagoSession();
  return cart.total;
}

export async function submitMercadoPagoPaymentAction(data: MercadoPagoBrickData) {
  try {
    await submitMercadoPagoPaymentData(data);
    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Não foi possível processar o pagamento.",
    };
  }
}

export async function completeCheckoutAction() {
  const result = await completeCheckout();
  revalidatePath("/", "layout");
  return result;
}
