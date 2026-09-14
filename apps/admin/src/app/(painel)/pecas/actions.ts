"use server";

import { revalidatePath } from "next/cache";
import { createPieceUnits, deletePieceUnit } from "@/lib/pecas";

export async function createPieceUnitsAction(input: { product_variant_id: string; quantity: number }) {
  await createPieceUnits(input);
  revalidatePath("/pecas");
}

export async function deletePieceUnitAction(id: string) {
  await deletePieceUnit(id);
  revalidatePath("/pecas");
}
