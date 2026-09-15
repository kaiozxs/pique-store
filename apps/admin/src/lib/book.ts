import "server-only";
import { sdk } from "./sdk";
import { authHeaders } from "./session";

export type BookMedia = { url: string; type: "image" | "video" };
export type BookContent = {
  status: "em_construcao" | "revelado" | "oculto";
  title: string | null;
  body: string | null;
  media: { items: BookMedia[] } | null;
};

export async function getBookContent(): Promise<BookContent> {
  const headers = await authHeaders();
  const { book_content } = await sdk.client.fetch<{ book_content: BookContent }>("/admin/book", {
    headers,
    cache: "no-store",
  });
  return book_content;
}

export async function upsertBookContent(input: {
  status: BookContent["status"];
  title: string | null;
  body: string | null;
  media: { items: BookMedia[] } | null;
}): Promise<void> {
  const headers = await authHeaders();
  await sdk.client.fetch("/admin/book", { method: "POST", body: input, headers });
}
