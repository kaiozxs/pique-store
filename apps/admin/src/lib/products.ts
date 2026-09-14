import "server-only";
import { sdk } from "./sdk";
import { authHeaders } from "./session";

export type ProductOption = { id: string; title: string; thumbnail: string | null };

export async function searchProducts(query: string): Promise<ProductOption[]> {
  const headers = await authHeaders();
  const { products } = await sdk.admin.product.list(
    { q: query || undefined, limit: 15, fields: "id,title,thumbnail" },
    headers
  );
  return products.map((p) => ({ id: p.id, title: p.title, thumbnail: p.thumbnail ?? null }));
}

export async function getProductsByIds(ids: string[]): Promise<ProductOption[]> {
  if (ids.length === 0) return [];
  const headers = await authHeaders();
  const { products } = await sdk.admin.product.list(
    { id: ids, limit: ids.length, fields: "id,title,thumbnail" },
    headers
  );
  return products.map((p) => ({ id: p.id, title: p.title, thumbnail: p.thumbnail ?? null }));
}
