"use server";

import { revalidatePath } from "next/cache";
import {
  completeCheckout,
  listShippingOptions,
  selectShippingOption,
  setCheckoutAddress,
  type ShippingAddressInput,
} from "./checkout";

export async function saveAddressAction(email: string, address: ShippingAddressInput) {
  const cart = await setCheckoutAddress(email, address);
  return cart;
}

export async function getShippingOptionsAction() {
  return listShippingOptions();
}

export async function selectShippingOptionAction(optionId: string) {
  return selectShippingOption(optionId);
}

export async function completeCheckoutAction() {
  const result = await completeCheckout();
  revalidatePath("/", "layout");
  return result;
}
