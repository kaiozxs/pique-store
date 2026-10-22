"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { ErroDeRegra } from "@pique/db";
import { concederAcesso, revogarAcesso } from "@/lib/acessos";
import type { Papel } from "@/lib/papel";

// Cada ação confere o papel de novo: esconder o botão não protege nada, quem
// protege é o servidor.
async function soDono(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.papel === "dono";
}

export async function concederAcessoAction(
  email: string,
  papel: Papel
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(await soDono())) return { ok: false, error: "Só o dono gerencia acessos." };
  if (papel !== "dono" && papel !== "lojista") return { ok: false, error: "Papel inválido." };
  try {
    await concederAcesso(email.trim(), papel);
    revalidatePath("/acessos");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof ErroDeRegra ? e.message : "Não deu certo. Confira o e-mail: a pessoa precisa ter conta na loja.",
    };
  }
}

export async function revogarAcessoAction(id: string): Promise<{ ok: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (user?.papel !== "dono") return { ok: false, error: "Só o dono gerencia acessos." };

  // O banco recusa remover o último dono (o painel não pode ficar sem ninguém no comando).
  try {
    await revogarAcesso(id);
  } catch (e) {
    return { ok: false, error: e instanceof ErroDeRegra ? e.message : "Não foi possível remover o acesso." };
  }
  revalidatePath("/acessos");
  return { ok: true };
}
