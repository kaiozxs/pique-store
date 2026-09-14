"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  addCustomerAddress,
  login,
  logout,
  registerAndLogin,
  removeCustomerAddress,
} from "@/lib/customer";
import type { ShippingAddressInput } from "@/lib/checkout";

export async function loginAction(
  _prevState: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Preencha e-mail e senha." };

  const result = await login(email, password);
  if (!result.ok) return { error: result.error };

  revalidatePath("/", "layout");
  redirect("/conta");
}

export async function registerAction(
  _prevState: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const firstName = String(formData.get("first_name") ?? "");
  const lastName = String(formData.get("last_name") ?? "");
  if (!email || !password || !firstName || !lastName) {
    return { error: "Preencha todos os campos." };
  }

  const result = await registerAndLogin({ email, password, first_name: firstName, last_name: lastName });
  if (!result.ok) return { error: result.error };

  revalidatePath("/", "layout");
  redirect("/conta");
}

export async function logoutAction() {
  await logout();
  revalidatePath("/", "layout");
  redirect("/conta");
}

export async function addAddressAction(input: ShippingAddressInput) {
  await addCustomerAddress(input);
  revalidatePath("/conta");
}

export async function removeAddressAction(addressId: string) {
  await removeCustomerAddress(addressId);
  revalidatePath("/conta");
}
