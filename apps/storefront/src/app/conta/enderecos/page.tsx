import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentCustomer } from "@/lib/customer";
import { ContaShell } from "@/components/conta/ContaShell";
import { EnderecosClient } from "./EnderecosClient";

export const metadata: Metadata = { title: "Endereços — PIQUE" };

export default async function EnderecosPage() {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/conta");

  return (
    <ContaShell
      titulo="Endereços"
      descricao="O endereço padrão vem preenchido no checkout. Você pode ter quantos quiser."
    >
      <EnderecosClient customer={customer} />
    </ContaShell>
  );
}
