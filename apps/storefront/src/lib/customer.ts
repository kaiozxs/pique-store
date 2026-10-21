import "server-only";
import { cache } from "react";
import {
  addAddress,
  assignToCustomer,
  db,
  ensureCustomer,
  findOpenCartForCustomer,
  getCart as lerCarrinho,
  getCustomer,
  getOrder,
  idPessoal as idPublico,
  listFavorites as lerFavoritos,
  listMyPieces as lerPecas,
  listOrders,
  removeAddress,
  setDefaultAddress,
  setPhoto,
  toggleFavorite as alternarFavorito,
  updateAddress,
  updateProfile,
  type AddressInput,
  type Customer,
  type MyPiece,
  type Order,
} from "@pique/db";
import { concluirGoogle, criarConta, entrarComSenha, nomesDoGoogle, sairDaConta, usuarioAtual } from "./auth";
import { clearCartId, getCartId, setCartId } from "./cart-session";

export type Cliente = Customer;
export type Pedido = Order;
export type PecaDaConta = MyPiece;

type ActionResult = { ok: true } | { ok: false; error: string };

/** Quem está logado, com endereços. Consultado uma vez por requisição. */
export const getCurrentCustomer = cache(async (): Promise<Cliente | null> => {
  const usuario = await usuarioAtual();
  if (!usuario) return null;
  let cliente = await getCustomer(db(), usuario.id);
  if (!cliente && usuario.email) {
    // Autenticou mas o cadastro ainda não existe (primeiro acesso): cria agora.
    await ensureCustomer(db(), { id: usuario.id, email: usuario.email });
    cliente = await getCustomer(db(), usuario.id);
  }
  return cliente;
});

async function exigirCliente(): Promise<string> {
  const usuario = await usuarioAtual();
  if (!usuario) throw new Error("Entre na sua conta.");
  return usuario.id;
}

/**
 * Depois do login: a sacola montada neste navegador passa para a conta; se
 * não há sacola aqui, volta a que a pessoa deixou guardada (em outro aparelho
 * ou ao sair). Melhor-esforço: falhar aqui nunca impede o login.
 */
export async function associarCarrinho(customerId: string): Promise<void> {
  try {
    const sql = db();
    const naMao = await getCartId();
    if (naMao) {
      const cart = await lerCarrinho(sql, naMao);
      const meu = cart && (!cart.customer_id || cart.customer_id === customerId);
      if (cart && meu && cart.items.length > 0) {
        await assignToCustomer(sql, naMao, customerId);
        return;
      }
      if (cart && !meu) await clearCartId(); // sacola de outra pessoa nunca é herdada
    }
    const guardada = await findOpenCartForCustomer(sql, customerId);
    if (guardada) await setCartId(guardada);
  } catch {
    // segue sem associar
  }
}

export async function login(email: string, password: string): Promise<ActionResult> {
  const r = await entrarComSenha(email, password);
  if (!r.ok) return r;
  await ensureCustomer(db(), { id: r.usuario.id, email: r.usuario.email });
  await associarCarrinho(r.usuario.id);
  return { ok: true };
}

export async function registerAndLogin(input: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}): Promise<ActionResult> {
  const r = await criarConta({ email: input.email, senha: input.password, nome: input.first_name, sobrenome: input.last_name });
  if (!r.ok) return r;
  await ensureCustomer(db(), { id: r.usuario.id, email: r.usuario.email, first_name: input.first_name, last_name: input.last_name });
  await updateProfile(db(), r.usuario.id, { first_name: input.first_name, last_name: input.last_name });
  await associarCarrinho(r.usuario.id);
  return { ok: true };
}

/** Fim do login com o Google (chamado pela rota /auth/callback). */
export async function completeGoogleLogin(code: string): Promise<ActionResult> {
  const r = await concluirGoogle(code);
  if (!r.ok) return r;
  const nomes = await nomesDoGoogle();
  await ensureCustomer(db(), { id: r.usuario.id, email: r.usuario.email, first_name: nomes.nome, last_name: nomes.sobrenome });
  await associarCarrinho(r.usuario.id);
  return { ok: true };
}

export async function logout(): Promise<void> {
  await sairDaConta();
  // A sacola continua guardada na conta: quem entrar de novo a encontra. O
  // cookie é solto para que o aparelho não mostre as escolhas de uma pessoa à próxima.
  await clearCartId();
}

// ───────── Pedidos ─────────

export async function getCustomerOrder(orderId: string): Promise<Pedido | null> {
  const usuario = await usuarioAtual();
  if (!usuario) return null;
  try {
    // Filtra pelo dono: trocar o id na barra de endereço não abre o pedido de outra pessoa.
    return await getOrder(db(), orderId, { customerId: usuario.id });
  } catch {
    return null;
  }
}

export async function listCustomerOrders(): Promise<Pedido[]> {
  const usuario = await usuarioAtual();
  if (!usuario) return [];
  return (await listOrders(db(), { customerId: usuario.id, limit: 50 })).orders;
}

// ───────── Endereços e perfil ─────────

export async function addCustomerAddress(input: AddressInput): Promise<void> {
  await addAddress(db(), await exigirCliente(), input);
}

export async function updateCustomerAddress(addressId: string, input: AddressInput): Promise<void> {
  await updateAddress(db(), await exigirCliente(), addressId, input);
}

export async function setDefaultCustomerAddress(addressId: string): Promise<void> {
  await setDefaultAddress(db(), await exigirCliente(), addressId);
}

export async function removeCustomerAddress(addressId: string, novoPadraoId?: string): Promise<void> {
  await removeAddress(db(), await exigirCliente(), addressId, novoPadraoId);
}

export async function updateCustomerProfile(input: { first_name?: string; last_name?: string; phone?: string }): Promise<void> {
  await updateProfile(db(), await exigirCliente(), input);
}

export async function updateCustomerPhoto(dataUrl: string | null): Promise<void> {
  await setPhoto(db(), await exigirCliente(), dataUrl);
}

export function fotoDoCliente(cliente: Cliente | null): string | null {
  return cliente?.photo ?? null;
}

/** ID pessoal exibido na conta: curto, estável e derivado do id interno. */
export function idPessoal(cliente: { id: string }): string {
  return idPublico(cliente.id);
}

// ───────── Favoritos e peças ─────────

export async function listFavorites(): Promise<string[]> {
  const usuario = await usuarioAtual();
  return usuario ? lerFavoritos(db(), usuario.id) : [];
}

export async function toggleFavorite(handle: string): Promise<{ favoritado: boolean }> {
  const usuario = await usuarioAtual();
  if (!usuario) return { favoritado: false };
  return alternarFavorito(db(), usuario.id, handle);
}

/** As peças registradas no nome do cliente logado — "Minhas Coleções". */
export async function listMyPieces(): Promise<PecaDaConta[]> {
  const usuario = await usuarioAtual();
  return usuario ? lerPecas(db(), usuario.id) : [];
}
