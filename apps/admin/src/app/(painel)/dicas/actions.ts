"use server";

import { revalidatePath } from "next/cache";
import { createTipPost, deleteTipPost, updateTipPost, type TipPostInput } from "@/lib/dicas";

export async function createTipPostAction(input: TipPostInput) {
  await createTipPost(input);
  revalidatePath("/dicas");
}

export async function updateTipPostAction(id: string, input: TipPostInput) {
  await updateTipPost(id, input);
  revalidatePath("/dicas");
}

export async function deleteTipPostAction(id: string) {
  await deleteTipPost(id);
  revalidatePath("/dicas");
}
