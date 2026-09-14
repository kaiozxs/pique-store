import "server-only";
import { sdk } from "./sdk";
import { authHeaders } from "./session";

export type WabMedia = { url: string; type: "image" | "video" };
export type WabContent = {
  status: "em_construcao" | "revelado" | "oculto";
  title: string | null;
  body: string | null;
  media: { items: WabMedia[] } | null;
};

export async function getWabContent(): Promise<WabContent> {
  const headers = await authHeaders();
  const { wab_content } = await sdk.client.fetch<{ wab_content: WabContent }>("/admin/wab", {
    headers,
    cache: "no-store",
  });
  return wab_content;
}

export async function upsertWabContent(input: {
  status: WabContent["status"];
  title: string | null;
  body: string | null;
  media: { items: WabMedia[] } | null;
}): Promise<void> {
  const headers = await authHeaders();
  await sdk.client.fetch("/admin/wab", { method: "POST", body: input, headers });
}
