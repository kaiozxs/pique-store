"use server";

import { revalidatePath } from "next/cache";
import { ErroDeRegra } from "@pique/db";
import { guardarImagem } from "@/lib/imagens";
import { ajustarEstoque, apagarProduto, salvarProduto, type ProductInput } from "@/lib/produtos";

type Falha = { ok: false; error: string };

function falha(e: unknown, padrao: string): Falha {
  return { ok: false, error: e instanceof ErroDeRegra || e instanceof Error ? e.message : padrao };
}

export async function salvarProdutoAction(input: ProductInput): Promise<{ ok: true; id: string } | Falha> {
  try {
    const id = await salvarProduto(input);
    revalidatePath("/produtos");
    return { ok: true, id };
  } catch (e) {
    return falha(e, "Não foi possível salvar o produto.");
  }
}

export async function apagarProdutoAction(id: string): Promise<{ ok: true; resultado: "apagado" | "arquivado" } | Falha> {
  try {
    const resultado = await apagarProduto(id);
    revalidatePath("/produtos");
    return { ok: true, resultado };
  } catch (e) {
    return falha(e, "Não foi possível apagar o produto.");
  }
}

export async function ajustarEstoqueAction(variantId: string, estoque: number): Promise<{ ok: true } | Falha> {
  try {
    await ajustarEstoque(variantId, estoque);
    revalidatePath("/produtos");
    return { ok: true };
  } catch (e) {
    return falha(e, "Não foi possível ajustar o estoque.");
  }
}

export async function enviarImagemAction(formData: FormData): Promise<{ ok: true; url: string } | Falha> {
  const arquivo = formData.get("arquivo");
  if (!(arquivo instanceof File) || arquivo.size === 0) return { ok: false, error: "Escolha uma imagem." };
  try {
    return { ok: true, url: await guardarImagem(arquivo) };
  } catch (e) {
    return falha(e, "Não foi possível enviar a imagem.");
  }
}
