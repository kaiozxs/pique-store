import "server-only";
import {
  db,
  ErroDeRegra,
  getCart as lerCarrinho,
  listShippingOptions as lerFretes,
  setCheckoutInfo,
  setShippingOption,
  type AddressInput,
  type Cart,
  type ShippingOption,
} from "@pique/db";
import { getCartId } from "./cart-session";
import { cepCompleto, cpfValido, nascimentoValido } from "./validacao";

export type ShippingAddressInput = AddressInput;
export type { ShippingOption };
export type CheckoutDocumentInput = { cpf: string; birth_date: string };

async function sacolaAtual(): Promise<string> {
  const id = await getCartId();
  if (!id) throw new ErroDeRegra("Sua sacola está vazia.", "carrinho");
  return id;
}

async function recarregar(cartId: string): Promise<Cart> {
  const cart = await lerCarrinho(db(), cartId);
  if (!cart) throw new ErroDeRegra("Sua sacola está vazia.", "carrinho");
  return cart;
}

/**
 * Valida de novo no servidor o que o formulário já conferiu: um envio direto,
 * sem passar pelo JavaScript da página, não pode furar as regras.
 */
export async function setCheckoutAddress(
  email: string,
  address: ShippingAddressInput,
  document: CheckoutDocumentInput
): Promise<Cart> {
  if (!address.first_name?.trim() || !address.last_name?.trim()) throw new ErroDeRegra("Informe nome e sobrenome.");
  if (!address.address_1?.trim() || !address.city?.trim()) throw new ErroDeRegra("Informe o endereço completo.");
  if (!address.phone?.trim()) throw new ErroDeRegra("Informe o telefone.");
  if ((address.country_code ?? "br").toLowerCase() === "br" && !cepCompleto(address.postal_code)) {
    throw new ErroDeRegra("CEP inválido: são 8 números.");
  }
  if (!cpfValido(document.cpf)) throw new ErroDeRegra("Esse CPF não é válido. Confira os números.");
  if (!nascimentoValido(document.birth_date)) throw new ErroDeRegra("Data de nascimento inválida.");

  const cartId = await sacolaAtual();
  await setCheckoutInfo(db(), cartId, { email, address: { ...address, country_code: (address.country_code || "br").toLowerCase() }, document });
  return recarregar(cartId);
}

export async function listShippingOptions(): Promise<ShippingOption[]> {
  return lerFretes(db());
}

export async function selectShippingOption(optionId: string): Promise<Cart> {
  const cartId = await sacolaAtual();
  await setShippingOption(db(), cartId, optionId);
  return recarregar(cartId);
}
