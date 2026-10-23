"use server";

import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  addCustomerAddress,
  listFavorites,
  login,
  logout,
  registerAndLogin,
  removeCustomerAddress,
  setDefaultCustomerAddress,
  toggleFavorite,
  updateCustomerAddress,
  updateCustomerPhoto,
  updateCustomerProfile,
} from "@/lib/customer";
import { ErroDeRegra } from "@pique/db";
import { urlDoGoogle } from "@/lib/auth";
import { COOKIE_DESTINO, destinoSeguro } from "@/lib/destino-login";
import { recaptchaValido } from "@/lib/recaptcha";
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
  // O navegador já exige marcar a caixa, mas quem manda o POST direto passa por aqui.
  if (!(await recaptchaValido(String(formData.get("captcha") ?? "")))) {
    return { error: "Não conseguimos confirmar que você não é um robô. Marque a caixa de novo." };
  }

  const result = await registerAndLogin({ email, password, first_name: firstName, last_name: lastName });
  if (!result.ok) return { error: result.error };

  revalidatePath("/", "layout");
  return { ok: true };
}

/**
 * Começa o login com o Google: devolve o endereço da tela do Google e guarda,
 * num cookie curto, para onde voltar depois (a pessoa sai do site e volta pelo
 * /auth/callback).
 */
export async function iniciarGoogleAction(retorno: string): Promise<{ url: string | null; error?: string }> {
  const h = await headers();
  const protocolo = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const origem = process.env.NEXT_PUBLIC_SITE_URL ?? `${protocolo}://${host}`;

  const url = await urlDoGoogle(origem);
  if (!url) return { url: null, error: "O login com o Google não está disponível agora." };

  (await cookies()).set(COOKIE_DESTINO, destinoSeguro(retorno), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });
  return { url };
}

export async function logoutAction() {
  await logout();
  revalidatePath("/", "layout");
  redirect("/conta");
}

type Resultado = { ok: true } | { ok: false; error: string };

function falha(e: unknown, padrao: string): { ok: false; error: string } {
  return { ok: false, error: e instanceof ErroDeRegra ? e.message : padrao };
}

export async function addAddressAction(input: ShippingAddressInput): Promise<Resultado> {
  try {
    await addCustomerAddress(input);
    revalidatePath("/conta");
    return { ok: true };
  } catch (e) {
    return falha(e, "Não foi possível salvar o endereço.");
  }
}

export async function removeAddressAction(addressId: string, novoPadraoId?: string): Promise<Resultado> {
  try {
    await removeCustomerAddress(addressId, novoPadraoId);
    revalidatePath("/conta");
    return { ok: true };
  } catch (e) {
    return falha(e, "Não foi possível excluir o endereço.");
  }
}

export async function updateAddressAction(addressId: string, input: ShippingAddressInput): Promise<Resultado> {
  try {
    await updateCustomerAddress(addressId, input);
    revalidatePath("/conta/enderecos");
    revalidatePath("/conta");
    return { ok: true };
  } catch (e) {
    return falha(e, "Não foi possível salvar o endereço.");
  }
}

export async function setDefaultAddressAction(addressId: string): Promise<Resultado> {
  try {
    await setDefaultCustomerAddress(addressId);
    revalidatePath("/conta/enderecos");
    revalidatePath("/conta");
    return { ok: true };
  } catch (e) {
    return falha(e, "Não foi possível definir o endereço padrão.");
  }
}

export async function updateProfileAction(input: { first_name?: string; last_name?: string; phone?: string }) {
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

export async function updatePhotoAction(dataUrl: string | null) {
  await updateCustomerPhoto(dataUrl);
  revalidatePath("/conta", "layout");
}
