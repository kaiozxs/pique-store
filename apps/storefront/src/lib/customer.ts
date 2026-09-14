import "server-only";
import type { HttpTypes } from "@medusajs/types";
import { sdk } from "./sdk";
import { getCartId } from "./cart-session";
import { clearCustomerToken, getCustomerToken, setCustomerToken } from "./customer-session";
import type { ShippingAddressInput } from "./checkout";

export type MedusaCustomer = HttpTypes.StoreCustomer;
export type MedusaCustomerOrder = HttpTypes.StoreOrder;

type ActionResult = { ok: true } | { ok: false; error: string };

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getCustomerToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function login(email: string, password: string): Promise<ActionResult> {
  try {
    const token = await sdk.auth.login("customer", "emailpass", { email, password });
    if (typeof token !== "string") {
      return { ok: false, error: "Este login exige uma etapa adicional não suportada aqui." };
    }
    await setCustomerToken(token);

    // Associa o carrinho guest atual (se existir) a essa conta. Melhor-esforço:
    // se falhar, o cliente continua com um carrinho guest normal.
    const cartId = await getCartId();
    if (cartId) {
      try {
        await sdk.store.cart.transferCart(cartId, {}, { Authorization: `Bearer ${token}` });
      } catch {
        // segue sem transferir
      }
    }

    return { ok: true };
  } catch {
    return { ok: false, error: "E-mail ou senha inválidos." };
  }
}

export async function registerAndLogin(input: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}): Promise<ActionResult> {
  try {
    const registrationToken = await sdk.auth.register("customer", "emailpass", {
      email: input.email,
      password: input.password,
    });
    if (typeof registrationToken !== "string") {
      return { ok: false, error: "Registro exige uma etapa adicional não suportada aqui." };
    }
    await sdk.store.customer.create(
      { email: input.email, first_name: input.first_name, last_name: input.last_name },
      {},
      { Authorization: `Bearer ${registrationToken}` }
    );
  } catch {
    return { ok: false, error: "Não foi possível criar a conta. O e-mail já pode estar em uso." };
  }

  return login(input.email, input.password);
}

export async function logout(): Promise<void> {
  await clearCustomerToken();
}

export async function getCurrentCustomer(): Promise<MedusaCustomer | null> {
  const headers = await authHeaders();
  if (!headers.Authorization) return null;
  try {
    const { customer } = await sdk.store.customer.retrieve({ fields: "*addresses" }, headers);
    return customer;
  } catch {
    return null;
  }
}

export async function listCustomerOrders(): Promise<MedusaCustomerOrder[]> {
  const headers = await authHeaders();
  if (!headers.Authorization) return [];
  try {
    const { orders } = await sdk.store.order.list(
      { limit: 50, fields: "id,display_id,total,currency_code,created_at,fulfillment_status,payment_status" },
      headers
    );
    return orders;
  } catch {
    return [];
  }
}

export async function addCustomerAddress(input: ShippingAddressInput): Promise<void> {
  const headers = await authHeaders();
  await sdk.store.customer.createAddress(input, {}, headers);
}

export async function removeCustomerAddress(addressId: string): Promise<void> {
  const headers = await authHeaders();
  await sdk.store.customer.deleteAddress(addressId, headers);
}
