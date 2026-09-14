import "server-only";
import { sdk } from "./sdk";
import { authHeaders } from "./session";

export type FaqItem = {
  id: string;
  category: string;
  question: string;
  answer: string;
  position: number;
  published: boolean;
};

export type FaqItemInput = {
  category: string;
  question: string;
  answer: string;
  position?: number;
  published: boolean;
};

export async function listFaqItems(): Promise<FaqItem[]> {
  const headers = await authHeaders();
  const { faq_items } = await sdk.client.fetch<{ faq_items: FaqItem[] }>("/admin/faq", {
    headers,
    cache: "no-store",
  });
  return faq_items;
}

export async function createFaqItem(input: FaqItemInput): Promise<void> {
  const headers = await authHeaders();
  await sdk.client.fetch("/admin/faq", { method: "POST", body: input, headers });
}

export async function updateFaqItem(id: string, input: FaqItemInput): Promise<void> {
  const headers = await authHeaders();
  await sdk.client.fetch(`/admin/faq/${id}`, { method: "POST", body: input, headers });
}

export async function deleteFaqItem(id: string): Promise<void> {
  const headers = await authHeaders();
  await sdk.client.fetch(`/admin/faq/${id}`, { method: "DELETE", headers });
}
