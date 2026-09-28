import "server-only";
import type { HttpTypes } from "@medusajs/types";
import { sdk } from "./sdk";
import { clearCartId, getCartId } from "./cart-session";
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
  // A sacola sai junto. Depois do login ela passa a pertencer àquele cliente
  // (o Medusa grava o customer_id no carrinho), então mantê-la no navegador
  // depois que ele sai mostra as escolhas de uma pessoa para a próxima que
  // usar o mesmo aparelho — e a contagem continuar no cabeçalho de quem não
  // está logado não faz sentido nenhum. O carrinho em si não é apagado no
  // servidor: quem entrar de novo na conta encontra os itens onde deixou.
  await clearCartId();
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
    // metadata precisa ser pedido explicitamente: com `fields` preenchido, o
    // Medusa devolve só o que foi listado — e é nele que moram os favoritos.
    const { customer } = await sdk.store.customer.retrieve(
      { fields: "*addresses,metadata" },
      headers
    );
    return customer;
  } catch {
    return null;
  }
}

/**
 * Um pedido específico do cliente logado, com tudo que a tela de detalhe
 * mostra: itens congelados na compra, entrega e rastreio.
 *
 * Passa pela sessão do próprio cliente — o Medusa só devolve pedido de quem
 * está autenticado, então não dá pra abrir o pedido dos outros trocando o id
 * na barra de endereço.
 */
export async function getCustomerOrder(orderId: string): Promise<MedusaCustomerOrder | null> {
  const headers = await authHeaders();
  if (!headers.Authorization) return null;
  try {
    const { order } = await sdk.store.order.retrieve(
      orderId,
      {
        fields:
          "id,display_id,status,total,subtotal,item_subtotal,item_total,shipping_total,tax_total,currency_code,created_at," +
          "email,payment_status,fulfillment_status,metadata,*items,*shipping_address,*shipping_methods," +
          "*payment_collections,*payment_collections.payments,*fulfillments",
      },
      headers
    );
    return order ?? null;
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

export async function updateCustomerAddress(
  addressId: string,
  input: ShippingAddressInput
): Promise<void> {
  const headers = await authHeaders();
  await sdk.store.customer.updateAddress(addressId, input, {}, headers);
}

/**
 * Marca um endereço como padrão de entrega.
 *
 * O Medusa não desmarca o anterior sozinho — se dois ficarem marcados, o
 * checkout passa a escolher um deles por ordem de chegada, que é o tipo de
 * ambiguidade que o cliente não entende e a gente não consegue explicar. Por
 * isso o antigo é desmarcado aqui antes de marcar o novo.
 */
export async function setDefaultCustomerAddress(addressId: string): Promise<void> {
  const headers = await authHeaders();
  const { customer } = await sdk.store.customer.retrieve({ fields: "*addresses" }, headers);

  const anteriores = (customer?.addresses ?? []).filter(
    (a) => a.is_default_shipping && a.id !== addressId
  );
  for (const antigo of anteriores) {
    await sdk.store.customer.updateAddress(antigo.id, { is_default_shipping: false }, {}, headers);
  }

  await sdk.store.customer.updateAddress(addressId, { is_default_shipping: true }, {}, headers);
}

/** Dados que o próprio cliente pode corrigir na conta. */
export async function updateCustomerProfile(input: {
  first_name?: string;
  last_name?: string;
  phone?: string;
}): Promise<void> {
  const headers = await authHeaders();
  await sdk.store.customer.update(input, {}, headers);
}

// Favoritos moram no metadata do cliente: é uma lista de handles de produto e
// não justifica uma tabela própria no backend. O importante é que agora eles
// pertencem à conta, e não à aba do navegador — antes sumiam ao fechar a
// página.
const CHAVE_FAVORITOS = "favoritos";

export async function listFavorites(): Promise<string[]> {
  const customer = await getCurrentCustomer();
  const bruto = (customer?.metadata as Record<string, unknown> | null)?.[CHAVE_FAVORITOS];
  return Array.isArray(bruto) ? bruto.filter((h): h is string => typeof h === "string") : [];
}

export async function toggleFavorite(handle: string): Promise<{ favoritado: boolean }> {
  const headers = await authHeaders();
  if (!headers.Authorization) return { favoritado: false };

  const atuais = await listFavorites();
  const jaTem = atuais.includes(handle);
  const novos = jaTem ? atuais.filter((h) => h !== handle) : [...atuais, handle];

  const customer = await getCurrentCustomer();
  await sdk.store.customer.update(
    { metadata: { ...(customer?.metadata ?? {}), [CHAVE_FAVORITOS]: novos } },
    {},
    headers
  );
  return { favoritado: !jaTem };
}

export async function removeCustomerAddress(addressId: string): Promise<void> {
  const headers = await authHeaders();
  await sdk.store.customer.deleteAddress(addressId, headers);
}
