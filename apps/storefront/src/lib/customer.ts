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

// O JWT do Medusa não é criptografado, só assinado — decodificar o payload
// aqui é só pra ler o nome/e-mail que o Google devolveu (usados pra criar o
// cliente na primeira vez). Não serve pra autorizar nada: toda requisição
// autenticada de verdade valida a assinatura no próprio backend.
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1];
    const json = Buffer.from(payload, "base64url").toString("utf-8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// Fecha o login/registro via Google depois do redirect de volta pro site:
// troca o `code`/`state` por um token (sdk.auth.callback), e ou o cliente já
// existe (só associa a sessão) ou é a primeira vez com essa conta Google —
// nesse caso cria o cliente com os dados do perfil do Google e pega um novo
// token já com o cliente vinculado (sdk.auth.refresh).
export async function completeGoogleLogin(query: { code: string; state: string }): Promise<ActionResult> {
  let token: string;
  try {
    const result = await sdk.auth.callback("customer", "google", query);
    if (typeof result !== "string") {
      return { ok: false, error: "Esse login precisa de uma etapa adicional não suportada aqui." };
    }
    token = result;
  } catch {
    return { ok: false, error: "Não foi possível confirmar o login com o Google." };
  }

  const bearer = { Authorization: `Bearer ${token}` };
  try {
    await sdk.store.customer.retrieve({}, bearer);
  } catch {
    const profile = decodeJwtPayload(token)?.user_metadata as
      | { email?: string; given_name?: string; family_name?: string }
      | undefined;
    if (!profile?.email) {
      return { ok: false, error: "O Google não retornou um e-mail pra essa conta." };
    }
    try {
      await sdk.store.customer.create(
        { email: profile.email, first_name: profile.given_name, last_name: profile.family_name },
        {},
        bearer
      );
      const refreshed = await sdk.auth.refresh(bearer);
      token = refreshed.token;
    } catch {
      return { ok: false, error: "Não foi possível criar sua conta com o Google." };
    }
  }

  await setCustomerToken(token);

  const cartId = await getCartId();
  if (cartId) {
    try {
      await sdk.store.cart.transferCart(cartId, {}, { Authorization: `Bearer ${token}` });
    } catch {
      // segue sem transferir
    }
  }

  return { ok: true };
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
