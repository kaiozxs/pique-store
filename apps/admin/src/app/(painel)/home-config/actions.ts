"use server";

import { revalidatePath } from "next/cache";
import { upsertHomeSections, type HomeSectionType } from "@/lib/home-config";

export async function saveHomeSectionsAction(
  sections: { type: HomeSectionType; position: number; visible: boolean; config: Record<string, string> | null }[]
) {
  await upsertHomeSections(sections);
  revalidatePath("/home-config");
}
