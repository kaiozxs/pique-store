import "server-only";
import { sdk } from "./sdk";
import { authHeaders } from "./session";

export type TipStatus = "draft" | "published";
export type TipPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  cover_image: string | null;
  status: TipStatus;
  published_at: string | null;
};

export type TipPostInput = {
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  cover_image: string | null;
  status: TipStatus;
};

export async function listTipPosts(): Promise<TipPost[]> {
  const headers = await authHeaders();
  const { tip_posts } = await sdk.client.fetch<{ tip_posts: TipPost[]; count: number }>("/admin/dicas", {
    headers,
    cache: "no-store",
  });
  return tip_posts;
}

export async function createTipPost(input: TipPostInput): Promise<void> {
  const headers = await authHeaders();
  await sdk.client.fetch("/admin/dicas", { method: "POST", body: input, headers });
}

export async function updateTipPost(id: string, input: TipPostInput): Promise<void> {
  const headers = await authHeaders();
  await sdk.client.fetch(`/admin/dicas/${id}`, { method: "POST", body: input, headers });
}

export async function deleteTipPost(id: string): Promise<void> {
  const headers = await authHeaders();
  await sdk.client.fetch(`/admin/dicas/${id}`, { method: "DELETE", headers });
}
