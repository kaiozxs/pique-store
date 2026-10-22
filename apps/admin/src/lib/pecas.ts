import "server-only";
import { createPieces, db, deletePiece, listPiecesAdmin, listProductsAdmin, type PieceAdmin } from "@pique/db";
import { exigirUsuario } from "./auth";

export type PieceStatus = "nao_registrado" | "registrado" | "revogado";
export type PieceUnit = {
  id: string;
  unique_code: string;
  product_variant_id: string;
  status: PieceStatus;
  current_owner_customer_id: string | null;
  order_id?: string | null;
  created_at: string;
  /** "Camiseta PIQUE Preta — P" */
  variant_label: string;
  /** ID pessoal (PQ-…) de quem tem a peça, nunca o id interno. */
  owner_public_id: string | null;
};

export type ProductWithVariants = {
  id: string;
  title: string;
  variants?: { id: string; title: string }[];
};

export function paraUnidade(p: PieceAdmin): PieceUnit {
  return {
    id: p.id,
    unique_code: p.code,
    product_variant_id: p.variant_id ?? "",
    status: p.status,
    current_owner_customer_id: p.owner_id,
    order_id: p.order_id,
    created_at: p.created_at,
    variant_label: p.product_title ? `${p.product_title}${p.variant_title ? ` — ${p.variant_title}` : ""}` : "Peça sem produto",
    owner_public_id: p.owner_public_id,
  };
}

export async function listPieceUnits(): Promise<PieceUnit[]> {
  await exigirUsuario();
  return (await listPiecesAdmin(db())).map(paraUnidade);
}

export async function listProductsWithVariants(): Promise<ProductWithVariants[]> {
  await exigirUsuario();
  const produtos = await listProductsAdmin(db());
  return produtos.map((p) => ({
    id: p.id,
    title: p.title,
    variants: p.variants.filter((v) => v.active).map((v) => ({ id: v.id, title: v.title })),
  }));
}

export async function createPieceUnits(input: { product_variant_id: string; quantity: number }): Promise<void> {
  await exigirUsuario();
  const quantidade = Math.floor(input.quantity);
  if (!(quantidade >= 1 && quantidade <= 500)) throw new Error("Informe uma quantidade entre 1 e 500.");
  await createPieces(db(), { variantId: input.product_variant_id, quantidade });
}

export async function deletePieceUnit(id: string): Promise<void> {
  await exigirUsuario();
  await deletePiece(db(), id);
}
