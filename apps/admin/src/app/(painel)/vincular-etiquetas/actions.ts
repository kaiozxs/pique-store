"use server";

import { revalidatePath } from "next/cache";
import { sdk } from "@/lib/sdk";
import { authHeaders } from "@/lib/session";
import { getCurrentUser } from "@/lib/auth";

export type SituacaoEtiqueta =
  | { tipo: "livre"; codigo: string }
  | { tipo: "vinculada"; codigo: string; peca: string; desde: string }
  | { tipo: "erro"; mensagem: string };

const FORMATO = /^[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/;

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

async function nomeDaVariante(variantId: string, headers: Record<string, string>): Promise<string> {
  try {
    const { variants } = await sdk.client.fetch<{ variants: { title: string; product?: { title: string } }[] }>(
      "/admin/product-variants",
      { headers, query: { id: variantId, fields: "title,product.title" } }
    );
    const v = variants[0];
    return v ? `${v.product?.title ?? "Peça"} — ${v.title}` : "Peça PIQUE";
  } catch {
    return "Peça PIQUE";
  }
}

export async function consultarEtiquetaAction(lido: string): Promise<SituacaoEtiqueta> {
  if (!(await getCurrentUser())) return { tipo: "erro", mensagem: "Sessão expirada. Entre de novo." };
  const codigo = normalizar(lido);
  if (!FORMATO.test(codigo)) {
    return { tipo: "erro", mensagem: "Esse QR não é uma etiqueta PIQUE (formato de código inválido)." };
  }

  const headers = await authHeaders();
  const { piece_units } = await sdk.client.fetch<{
    piece_units: { product_variant_id: string; created_at: string }[];
  }>("/admin/pecas", { headers, query: { unique_code: codigo }, cache: "no-store" });

  const peca = piece_units[0];
  if (!peca) return { tipo: "livre", codigo };
  return {
    tipo: "vinculada",
    codigo,
    peca: await nomeDaVariante(peca.product_variant_id, headers),
    desde: peca.created_at,
  };
}

export async function vincularEtiquetaAction(
  codigo: string,
  productVariantId: string
): Promise<SituacaoEtiqueta> {
  if (!(await getCurrentUser())) return { tipo: "erro", mensagem: "Sessão expirada. Entre de novo." };
  const headers = await authHeaders();
  try {
    await sdk.client.fetch("/admin/pecas/vincular", {
      method: "POST",
      headers,
      body: { unique_code: codigo, product_variant_id: productVariantId },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    return {
      tipo: "erro",
      mensagem: msg.includes("já está vinculada")
        ? "Esta etiqueta já está vinculada e não pode ser alterada."
        : "Não foi possível vincular agora. Tente de novo.",
    };
  }
  revalidatePath("/pecas");
  return consultarEtiquetaAction(codigo);
}
