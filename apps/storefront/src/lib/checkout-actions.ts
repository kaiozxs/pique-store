"use server";

import { revalidatePath } from "next/cache";
import { ErroDeRegra, type Cart } from "@pique/db";
import {
  listShippingOptions,
  selectShippingOption,
  setCheckoutAddress,
  type CheckoutDocumentInput,
  type ShippingAddressInput,
  type ShippingOption,
} from "./checkout";
import { pagar, type DadosDoBrick, type ResultadoPagamento } from "./pagamento";

type ComCarrinho = { ok: true; cart: Cart } | { ok: false; error: string };

function falha(e: unknown, padrao: string): { ok: false; error: string } {
  return { ok: false, error: e instanceof ErroDeRegra ? e.message : padrao };
}

export async function saveAddressAction(
  email: string,
  address: ShippingAddressInput,
  document: CheckoutDocumentInput
): Promise<ComCarrinho> {
  try {
    return { ok: true, cart: await setCheckoutAddress(email, address, document) };
  } catch (e) {
    return falha(e, "Não foi possível salvar o endereço. Confira os campos.");
  }
}

export async function getShippingOptionsAction(): Promise<ShippingOption[]> {
  return listShippingOptions();
}

export async function selectShippingOptionAction(optionId: string): Promise<ComCarrinho> {
  try {
    return { ok: true, cart: await selectShippingOption(optionId) };
  } catch (e) {
    return falha(e, "Não foi possível selecionar o frete.");
  }
}

export async function payAction(dados: DadosDoBrick): Promise<ResultadoPagamento> {
  const resultado = await pagar(dados);
  revalidatePath("/", "layout");
  return resultado;
}
