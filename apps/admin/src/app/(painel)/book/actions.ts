"use server";

import { revalidatePath } from "next/cache";
import { upsertBookContent, type BookContent, type BookMedia } from "@/lib/book";

export async function saveBookAction(input: {
  status: BookContent["status"];
  title: string | null;
  body: string | null;
  media: { items: BookMedia[] } | null;
}) {
  await upsertBookContent(input);
  revalidatePath("/book");
}
