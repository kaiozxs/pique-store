import "server-only";
import { sdk } from "./sdk";
import { authHeaders } from "./session";

export type HomeSectionType = "hero" | "drop_destaque" | "wab_teaser" | "dicas_destaque" | "apresentacao";
export type HomeSection = {
  type: HomeSectionType;
  label: string;
  position: number;
  visible: boolean;
  config: Record<string, string> | null;
};

export async function getHomeSections(): Promise<HomeSection[]> {
  const headers = await authHeaders();
  const { sections } = await sdk.client.fetch<{ sections: HomeSection[] }>("/admin/home-config", {
    headers,
    cache: "no-store",
  });
  return sections;
}

export async function upsertHomeSections(
  sections: { type: HomeSectionType; position: number; visible: boolean; config: Record<string, string> | null }[]
): Promise<void> {
  const headers = await authHeaders();
  await sdk.client.fetch("/admin/home-config", { method: "POST", body: { sections }, headers });
}
