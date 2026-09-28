"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  addCustomerAddress,
  listFavorites,
  setDefaultCustomerAddress,
  toggleFavorite,
  updateCustomerAddress,
  updateCustomerProfile,
  completeGoogleLogin,
  login,
  logout,
  registerAndLogin,
  removeCustomerAddress,
} from "@/lib/customer";
import type { ShippingAddressInput } from "@/lib/checkout";

// Validado de novo aqui (além do client, em AuthForms) porque um form pode
// ser enviado direto, sem passar pelo JS do navegador.
const STRONG_PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

// Não redireciona daqui de propósito: esse form é reaproveitado tanto na
// página /conta (que quer voltar pra ela mesma) quanto dentro do checkout
// (que quer é continuar pro pagamento, sem sair da página) — quem decide
// pra onde ir depois do sucesso é o componente que chamou, via `ok: true`.
export async function loginAction(
  _prevState: { error?: string; ok?: true } | undefined,
  formData: FormData
): Promise<{ error?: string; ok?: true }> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Preencha e-mail e senha." };

  const result = await login(email, password);
  if (!result.ok) return { error: result.error };

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function registerAction(
  _prevState: { error?: string; ok?: true } | undefined,
  formData: FormData
): Promise<{ error?: string; ok?: true }> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const passwordConfirmation = String(formData.get("password_confirmation") ?? "");
  const firstName = String(formData.get("first_name") ?? "");
  const lastName = String(formData.get("last_name") ?? "");
  if (!email || !password || !firstName || !lastName) {
    return { error: "Preencha todos os campos." };
  }
  if (!STRONG_PASSWORD_RE.test(password)) {
    return { error: "A senha precisa ter pelo menos 8 caracteres, com letra maiúscula, minúscula e número." };
  }
  if (password !== passwordConfirmation) {
    return { error: "As senhas não coincidem." };
  }

  const result = await registerAndLogin({ email, password, first_name: firstName, last_name: lastName });
  if (!result.ok) return { error: result.error };

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function completeGoogleLoginAction(query: {
  code: string;
  state: string;
}): Promise<{ error?: string; ok?: true }> {
  const result = await completeGoogleLogin(query);
  if (!result.ok) return { error: result.error };

  revalidatePath("/", "layout");
  return { ok: true };
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

export async function updateAddressAction(addressId: string, input: ShippingAddressInput) {
  await updateCustomerAddress(addressId, input);
  revalidatePath("/conta/enderecos");
  revalidatePath("/conta");
}

export async function setDefaultAddressAction(addressId: string) {
  await setDefaultCustomerAddress(addressId);
  revalidatePath("/conta/enderecos");
  revalidatePath("/conta");
}

export async function updateProfileAction(input: {
  first_name?: string;
  last_name?: string;
  phone?: string;
}) {
  await updateCustomerProfile(input);
  revalidatePath("/conta");
}

export async function toggleFavoriteAction(handle: string) {
  const resultado = await toggleFavorite(handle);
  revalidatePath("/conta/favoritos");
  return resultado;
}

export async function listFavoritesAction() {
  return listFavorites();
}
