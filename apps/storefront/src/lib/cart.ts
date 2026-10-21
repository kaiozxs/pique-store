import "server-only";
import { cache } from "react";
import { createCart, db, getCart as lerCarrinho, type Cart } from "@pique/db";
import { usuarioAtual } from "./auth";
import { clearCartId, getCartId, setCartId } from "./cart-session";

export type { Cart };

/**
 * A sacola desta requisição (lida do cookie), ou null. Consultada uma vez por
 * requisição: o cabeçalho e a página pedem a mesma e não repetem a ida ao banco.
 */
export const getCart = cache(async (): Promise<Cart | null> => {
  const id = await getCartId();
  if (!id) return null;
  try {
    const cart = await lerCarrinho(db(), id);
    // Sacola encerrada (virou pedido) ou que não existe mais: solta o cookie.
    if (!cart) await clearCartId();
    return cart;
  } catch {
    return null; // cookie com valor inválido
  }
});

/** O id da sacola atual; cria uma nova (já no nome de quem está logado) se ainda não há. */
export async function getOrCreateCartId(): Promise<string> {
  const existente = await getCart();
  if (existente) return existente.id;
  const usuario = await usuarioAtual();
  const id = await createCart(db(), usuario?.id ?? null);
  await setCartId(id);
  return id;
}
