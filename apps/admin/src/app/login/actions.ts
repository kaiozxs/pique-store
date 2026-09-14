"use server";

import { redirect } from "next/navigation";
import { login } from "@/lib/auth";

export async function loginAction(
  _prevState: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/");

  if (!email || !password) {
    return { error: "Preencha e-mail e senha." };
  }

  const result = await login(email, password);
  if (!result.ok) {
    return { error: result.error };
  }

  redirect(next.startsWith("/") ? next : "/");
}
