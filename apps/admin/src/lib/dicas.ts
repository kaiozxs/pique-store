import "server-only";
import { db, deleteTip, listTipsAdmin, saveTip } from "@pique/db";
import { exigirUsuario } from "./auth";

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
  await exigirUsuario();
  return listTipsAdmin(db());
}

export async function createTipPost(input: TipPostInput): Promise<void> {
  await exigirUsuario();
  await saveTip(db(), input);
}

export async function updateTipPost(id: string, input: TipPostInput): Promise<void> {
  await exigirUsuario();
  await saveTip(db(), { ...input, id });
}

export async function deleteTipPost(id: string): Promise<void> {
  await exigirUsuario();
  await deleteTip(db(), id);
}
