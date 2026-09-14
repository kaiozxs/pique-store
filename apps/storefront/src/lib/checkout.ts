import "server-only";
import type { HttpTypes } from "@medusajs/types";
import { sdk } from "./sdk";
import { getOrCreateCart, type MedusaCart } from "./cart";
import { clearCartId } from "./cart-session";

export type ShippingAddressInput = {
  first_name: string;
  last_name: string;
  address_1: string;
  address_2?: string;
  city: string;
  province?: string;
  postal_code: string;
  country_code: string;
  phone?: string;
};

export type ShippingOption = HttpTypes.StoreCartShippingOption;

const SYSTEM_PAYMENT_PROVIDER_ID = "pp_system_default";

export async function setCheckoutAddress(email: string, address: ShippingAddressInput): Promise<MedusaCart> {
  const cart = await getOrCreateCart();
  const { cart: updated } = await sdk.store.cart.update(cart.id, {
    email,
    shipping_address: address,
    billing_address: address,
  });
  return updated;
}

export async function listShippingOptions(): Promise<ShippingOption[]> {
  const cart = await getOrCreateCart();
  const { shipping_options } = await sdk.store.fulfillment.listCartOptions({ cart_id: cart.id });
  return shipping_options;
}

export async function selectShippingOption(optionId: string): Promise<MedusaCart> {
  const cart = await getOrCreateCart();
  const { cart: updated } = await sdk.store.cart.addShippingMethod(cart.id, { option_id: optionId });
  return updated;
}

export type CompleteCheckoutResult =
  | { ok: true; order: HttpTypes.StoreOrder }
  | { ok: false; error: string };

export async function completeCheckout(): Promise<CompleteCheckoutResult> {
  const cart = await getOrCreateCart();

  try {
    if (!cart.payment_collection?.payment_sessions?.length) {
      await sdk.store.payment.initiatePaymentSession(cart, { provider_id: SYSTEM_PAYMENT_PROVIDER_ID });
    }

    const result = await sdk.store.cart.complete(cart.id);
    if (result.type === "order") {
      await clearCartId();
      return { ok: true, order: result.order };
    }
    return { ok: false, error: result.error?.message ?? "Não foi possível concluir o pedido." };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Não foi possível concluir o pedido." };
  }
}
