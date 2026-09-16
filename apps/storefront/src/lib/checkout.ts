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
const MERCADOPAGO_PROVIDER_ID = "pp_mercadopago";

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

// Garante que existe uma sessão de pagamento do Mercado Pago pro carrinho
// atual — chamado quando o comprador chega no passo de pagamento. Não cria
// duas se já tiver uma (o SDK do Medusa não tem um endpoint de "atualizar
// sessão", só de criar — criar de novo pra um provider que já tem sessão
// ativa criaria uma segunda à toa).
export async function ensureMercadoPagoSession(): Promise<MedusaCart> {
  const cart = await getOrCreateCart();
  const existing = cart.payment_collection?.payment_sessions?.find(
    (s) => s.provider_id === MERCADOPAGO_PROVIDER_ID
  );
  if (existing) return cart;

  const { payment_collection } = await sdk.store.payment.initiatePaymentSession(cart, {
    provider_id: MERCADOPAGO_PROVIDER_ID,
  });
  return { ...cart, payment_collection };
}

export type MercadoPagoBrickData = {
  token: string;
  payment_method_id: string;
  installments?: number;
  issuer_id?: string | number;
  payer_email?: string;
};

// Manda os dados que o Brick devolveu (token de cartão de uso único, etc)
// pra rota própria do backend, que grava na sessão de pagamento — é o que
// o provider usa depois, quando o carrinho é finalizado, pra cobrar de
// verdade no Mercado Pago.
export async function submitMercadoPagoPaymentData(data: MercadoPagoBrickData): Promise<void> {
  const cart = await getOrCreateCart();
  await sdk.client.fetch("/store/checkout/mercadopago", {
    method: "POST",
    body: { cart_id: cart.id, ...data },
  });
}

export type CompleteCheckoutResult =
  | { ok: true; order: HttpTypes.StoreOrder }
  | { ok: false; error: string };

export async function completeCheckout(): Promise<CompleteCheckoutResult> {
  const cart = await getOrCreateCart();

  try {
    if (!cart.payment_collection?.payment_sessions?.length) {
      // Nenhum passo de pagamento rodou (não deveria acontecer no fluxo
      // normal) — cai pro provider "fake" só pra não travar o checkout.
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
