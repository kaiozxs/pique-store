"use server";

import { revalidatePath } from "next/cache";
import { createFaqItem, deleteFaqItem, updateFaqItem, type FaqItemInput } from "@/lib/faq";

export async function createFaqItemAction(input: FaqItemInput) {
  await createFaqItem(input);
  revalidatePath("/faq");
}

export async function updateFaqItemAction(id: string, input: FaqItemInput) {
  await updateFaqItem(id, input);
  revalidatePath("/faq");
}

export async function deleteFaqItemAction(id: string) {
  await deleteFaqItem(id);
  revalidatePath("/faq");
}
