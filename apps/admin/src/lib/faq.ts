import "server-only";
import { db, deleteFaq, listFaqAdmin, saveFaq } from "@pique/db";
import { exigirUsuario } from "./auth";

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
  await exigirUsuario();
  return listFaqAdmin(db());
}

export async function createFaqItem(input: FaqItemInput): Promise<void> {
  await exigirUsuario();
  await saveFaq(db(), { ...input, position: input.position ?? 0 });
}

export async function updateFaqItem(id: string, input: FaqItemInput): Promise<void> {
  await exigirUsuario();
  await saveFaq(db(), { ...input, position: input.position ?? 0, id });
}

export async function deleteFaqItem(id: string): Promise<void> {
  await exigirUsuario();
  await deleteFaq(db(), id);
}
