"use server";

import { revalidatePath } from "next/cache";
import { upsertWabContent, type WabContent, type WabMedia } from "@/lib/wab";

export async function saveWabAction(input: {
  status: WabContent["status"];
  title: string | null;
  body: string | null;
  media: { items: WabMedia[] } | null;
}) {
  await upsertWabContent(input);
  revalidatePath("/wab");
}
