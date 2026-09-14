import "server-only";
import { sdk } from "./sdk";
import { authHeaders } from "./session";

export type PieceStatus = "nao_registrado" | "registrado" | "revogado";
export type PieceUnit = {
  id: string;
  unique_code: string;
  product_variant_id: string;
  status: PieceStatus;
  current_owner_customer_id: string | null;
  created_at: string;
};

export type ProductWithVariants = {
  id: string;
  title: string;
  variants?: { id: string; title: string }[];
};

export async function listPieceUnits(): Promise<PieceUnit[]> {
  const headers = await authHeaders();
  const { piece_units } = await sdk.client.fetch<{ piece_units: PieceUnit[]; count: number }>("/admin/pecas", {
    headers,
    cache: "no-store",
  });
  return piece_units;
}

export async function listProductsWithVariants(): Promise<ProductWithVariants[]> {
  const headers = await authHeaders();
  const { products } = await sdk.admin.product.list({ limit: 100, fields: "id,title,*variants" }, headers);
  return products as ProductWithVariants[];
}

export async function createPieceUnits(input: { product_variant_id: string; quantity: number }): Promise<void> {
  const headers = await authHeaders();
  await sdk.client.fetch("/admin/pecas", { method: "POST", body: input, headers });
}

export async function deletePieceUnit(id: string): Promise<void> {
  const headers = await authHeaders();
  await sdk.client.fetch(`/admin/pecas/${id}`, { method: "DELETE", headers });
}
