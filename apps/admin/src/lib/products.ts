import "server-only";
import { db, listProductsAdmin } from "@pique/db";
import { exigirUsuario } from "./auth";

// Seleção de produtos no painel (ex.: drop da semana). O identificador é o
// "handle" (endereço do produto), que é o que a vitrine usa.
export type ProductOption = { id: string; title: string; thumbnail: string | null };

export async function searchProducts(query: string): Promise<ProductOption[]> {
  await exigirUsuario();
  const produtos = await listProductsAdmin(db(), { q: query });
  return produtos.slice(0, 15).map((p) => ({ id: p.handle, title: p.title, thumbnail: p.thumbnail }));
}

export async function getProductsByIds(handles: string[]): Promise<ProductOption[]> {
  await exigirUsuario();
  if (handles.length === 0) return [];
  const todos = await listProductsAdmin(db());
  const porHandle = new Map(todos.map((p) => [p.handle, p]));
  return handles.flatMap((h) => {
    const p = porHandle.get(h);
    return p ? [{ id: p.handle, title: p.title, thumbnail: p.thumbnail }] : [];
  });
}
