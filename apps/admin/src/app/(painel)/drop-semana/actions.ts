"use server";

import { revalidatePath } from "next/cache";
import { upsertDropWeek } from "@/lib/drop-semana";
import { searchProducts, type ProductOption } from "@/lib/products";

export async function searchProductsAction(query: string): Promise<ProductOption[]> {
  return searchProducts(query);
}

export async function saveDropWeekAction(input: {
  title: string | null;
  status: "draft" | "published";
  product_ids: string[];
}) {
  await upsertDropWeek(input);
  revalidatePath("/drop-semana");
}
