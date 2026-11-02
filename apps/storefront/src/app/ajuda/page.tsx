import type { Metadata } from "next";
import { getFaqCategories } from "@/lib/catalogo";
import { CentralDeAjuda } from "@/components/ajuda/CentralDeAjuda";

export const metadata: Metadata = {
  title: "QG — PIQUE",
  description: "QG da PIQUE, a central de atendimento: pedidos, entregas, trocas, cancelamentos e contato.",
};

export default async function AjudaPage() {
  // Perguntas cadastradas no painel (FAQ). Se o banco falhar, a central abre do mesmo jeito.
  const faq = await getFaqCategories().catch(() => []);
  return <CentralDeAjuda faq={faq} />;
}
