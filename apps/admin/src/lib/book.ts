import "server-only";
import { db, getBookContent as buscar, upsertBookContent as salvar } from "@pique/db";
import { exigirUsuario } from "./auth";

export type BookMedia = { url: string; type: "image" | "video" };
export type BookContent = {
  status: "em_construcao" | "revelado" | "oculto";
  title: string | null;
  body: string | null;
  media: { items: BookMedia[] } | null;
};

export async function getBookContent(): Promise<BookContent> {
  await exigirUsuario();
  return buscar(db());
}

export async function upsertBookContent(input: BookContent): Promise<void> {
  await exigirUsuario();
  await salvar(db(), input);
}
