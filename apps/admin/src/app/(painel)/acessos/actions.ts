"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { concederAcesso, listAcessos, revogarAcesso } from "@/lib/acessos";
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
  } catch {
    return {
      ok: false,
      error: "Não deu certo. Confira o e-mail: a pessoa precisa ter conta na loja.",
    };
  }
}

export async function revogarAcessoAction(id: string): Promise<{ ok: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (user?.papel !== "dono") return { ok: false, error: "Só o dono gerencia acessos." };

  // Nunca deixa o painel sem nenhum dono por acesso concedido pelo site: o
  // último dono não pode ser removido.
  const todos = await listAcessos();
  const alvo = todos.find((a) => a.id === id);
  if (alvo?.papel === "dono" && todos.filter((a) => a.papel === "dono").length <= 1) {
    return { ok: false, error: "Esse é o último dono. Conceda o acesso a outra pessoa antes." };
  }

  await revogarAcesso(id);
  revalidatePath("/acessos");
  return { ok: true };
}
