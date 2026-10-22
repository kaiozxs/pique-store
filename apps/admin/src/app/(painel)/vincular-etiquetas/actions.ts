"use server";

import { revalidatePath } from "next/cache";
import { db, ErroDeRegra, FORMATO_CODIGO, linkLabel, listPiecesAdmin } from "@pique/db";
import { getCurrentUser } from "@/lib/auth";

export type SituacaoEtiqueta =
  | { tipo: "livre"; codigo: string }
  | { tipo: "vinculada"; codigo: string; peca: string; desde: string }
  | { tipo: "erro"; mensagem: string };

/** O QR traz o link de verificação; aqui interessa só o código. */
function normalizar(lido: string): string {
  const t = lido.trim();
  try {
    const url = new URL(t);
    const c = url.searchParams.get("codigo") ?? url.searchParams.get("code");
    if (c) return c.trim().toUpperCase();
  } catch {
    // não é link: o texto já é o código
  }
  return t.toUpperCase();
}

export async function consultarEtiquetaAction(lido: string): Promise<SituacaoEtiqueta> {
  if (!(await getCurrentUser())) return { tipo: "erro", mensagem: "Sessão expirada. Entre de novo." };
  const codigo = normalizar(lido);
  if (!FORMATO_CODIGO.test(codigo)) {
    return { tipo: "erro", mensagem: "Esse QR não é uma etiqueta PIQUE (formato de código inválido)." };
  }

  const [peca] = await listPiecesAdmin(db(), { code: codigo });
  if (!peca) return { tipo: "livre", codigo };
  const nome = peca.product_title ? `${peca.product_title}${peca.variant_title ? ` — ${peca.variant_title}` : ""}` : "Peça PIQUE";
  return { tipo: "vinculada", codigo, peca: nome, desde: peca.created_at };
}

export async function vincularEtiquetaAction(codigo: string, productVariantId: string): Promise<SituacaoEtiqueta> {
  if (!(await getCurrentUser())) return { tipo: "erro", mensagem: "Sessão expirada. Entre de novo." };
  try {
    await linkLabel(db(), codigo, productVariantId);
  } catch (e) {
    // O banco recusa código repetido: o vínculo é definitivo e a trava mora lá.
    return {
      tipo: "erro",
      mensagem: e instanceof ErroDeRegra ? e.message : "Não foi possível vincular agora. Tente de novo.",
    };
  }
  revalidatePath("/pecas");
  return consultarEtiquetaAction(codigo);
}
