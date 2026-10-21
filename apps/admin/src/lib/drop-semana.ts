import "server-only";
import { db, getDropAdmin, saveDrop } from "@pique/db";
import { exigirUsuario } from "./auth";
import { getProductsByIds, type ProductOption } from "./products";

export type DropWeekItem = { product_id: string; position: number; product: ProductOption | null };
export type DropWeek = { id: string; title: string | null; status: string } | null;

export async function getDropWeek(): Promise<{ drop_week: DropWeek; items: DropWeekItem[] }> {
  await exigirUsuario();
  const drop = await getDropAdmin(db());
  const produtos = new Map((await getProductsByIds(drop.handles)).map((p) => [p.id, p]));
  return {
    drop_week: { id: "drop", title: drop.title, status: drop.status },
    items: drop.handles.map((h, position) => ({ product_id: h, position, product: produtos.get(h) ?? null })),
  };
}

/** `product_ids` são os endereços (handles) dos produtos, na ordem da vitrine. */
export async function upsertDropWeek(input: {
  title: string | null;
  status: "draft" | "published";
  product_ids: string[];
}): Promise<void> {
  await exigirUsuario();
  await saveDrop(db(), { title: input.title, status: input.status, handles: input.product_ids });
}
