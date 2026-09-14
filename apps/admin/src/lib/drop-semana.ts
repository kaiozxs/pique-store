import "server-only";
import { sdk } from "./sdk";
import { authHeaders } from "./session";
import type { ProductOption } from "./products";

export type DropWeekItem = { product_id: string; position: number; product: ProductOption | null };
export type DropWeek = { id: string; title: string | null; status: string } | null;

export async function getDropWeek(): Promise<{ drop_week: DropWeek; items: DropWeekItem[] }> {
  const headers = await authHeaders();
  return sdk.client.fetch<{ drop_week: DropWeek; items: DropWeekItem[] }>("/admin/drop-semana", {
    headers,
    cache: "no-store",
  });
}

export async function upsertDropWeek(input: {
  title: string | null;
  status: "draft" | "published";
  product_ids: string[];
}): Promise<void> {
  const headers = await authHeaders();
  await sdk.client.fetch("/admin/drop-semana", { method: "POST", body: input, headers });
}
