import "server-only";
import { cookies } from "next/headers";

const CART_ID_COOKIE = "piquestore_cart_id";

export async function getCartId(): Promise<string | null> {
  const store = await cookies();
  return store.get(CART_ID_COOKIE)?.value ?? null;
}

export async function setCartId(cartId: string): Promise<void> {
  const store = await cookies();
  store.set(CART_ID_COOKIE, cartId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    // Sem maxAge de propósito: vira cookie de sessão, ou seja, a sacola dura
    // enquanto o navegador estiver aberto e some quando a pessoa fecha. Foi
    // decisão da marca — o padrão do comércio eletrônico é guardar por dias,
    // porque quem monta a sacola hoje costuma fechar a compra depois, e a
    // Política de Cancelamentos publicada promete que o carrinho permanece
    // quando a tentativa de pagamento expira (o que continua valendo dentro
    // da mesma visita). Pra voltar ao comportamento anterior, basta devolver
    // `maxAge: 60 * 60 * 24 * 30` aqui.
  });
}

export async function clearCartId(): Promise<void> {
  try {
    const store = await cookies();
    store.delete(CART_ID_COOKIE);
  } catch {
    // `getCart()` chama isso ao encontrar um cart_id inválido (ex: carrinho
    // completado/expirado), e é lido em toda página via o Header — mas o
    // Next só deixa escrever cookie em Server Action/Route Handler. Fora
    // desses contextos isso lançava um erro em toda navegação (piorando a
    // lentidão sentida). Best-effort: se não der pra limpar agora, o cookie
    // é limpo na próxima chamada feita de dentro de uma Server Action real
    // (ex: adicionar ao carrinho).
  }
}
