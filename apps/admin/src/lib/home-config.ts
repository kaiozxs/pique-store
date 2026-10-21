import "server-only";
import { db, listHomeSectionsAdmin, upsertHomeSections as salvarSecoes } from "@pique/db";
import { exigirUsuario } from "./auth";

export type HomeSectionType = "hero" | "drop_destaque" | "wab_teaser" | "dicas_destaque" | "apresentacao";
export type HomeSection = {
  type: HomeSectionType;
  label: string;
  position: number;
  visible: boolean;
  config: Record<string, string> | null;
};

const TIPOS: { type: HomeSectionType; label: string }[] = [
  { type: "hero", label: "Hero (abertura)" },
  { type: "drop_destaque", label: "Drop da Semana" },
  { type: "wab_teaser", label: "Book" },
  { type: "dicas_destaque", label: "Dicas" },
  { type: "apresentacao", label: "Apresentação da PIQUE" },
];

/** Sempre devolve as cinco seções, mesmo as que ainda não foram salvas. */
export async function getHomeSections(): Promise<HomeSection[]> {
  await exigirUsuario();
  const existentes = new Map((await listHomeSectionsAdmin(db())).map((s) => [s.type, s]));
  return TIPOS.map(({ type, label }, i) => {
    const s = existentes.get(type);
    return { type, label, position: s?.position ?? i, visible: s?.visible ?? true, config: s?.config ?? null };
  }).sort((a, b) => a.position - b.position);
}

export async function upsertHomeSections(
  sections: { type: HomeSectionType; position: number; visible: boolean; config: Record<string, string> | null }[]
): Promise<void> {
  await exigirUsuario();
  await salvarSecoes(db(), sections);
}
