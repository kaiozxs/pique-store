import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getCurrentCustomer } from "@/lib/customer";
import { AuthForms } from "./AuthForms";
import { AccountDashboard } from "./AccountDashboard";

export const metadata: Metadata = { title: "Conta — PIQUE" };

export default async function ContaPage() {
  const customer = await getCurrentCustomer();

  if (!customer) {
    // Tela cheia por cima do cabeçalho e do rodapé: quem está entrando não
    // precisa de vitrine, só do formulário. A foto fica de um lado e o
    // formulário do outro; no celular só o formulário.
    return (
      <div className="fixed inset-0 z-[55] overflow-y-auto bg-ink text-paper lg:grid lg:grid-cols-[1.1fr_1fr] lg:overflow-hidden">
        <div className="relative hidden lg:block">
          <Image src="/images/hero-praia.jpg" alt="" fill priority sizes="55vw" className="object-cover" />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/50" />
          <div className="absolute inset-x-0 bottom-0 p-10">
            <h2 className="font-display text-[clamp(2rem,5vh,3.25rem)] leading-[1.05] tracking-wide">
              DA RUA PRA
              <br />
              QUEM É DA RUA.
            </h2>
            <p className="mt-4 max-w-sm text-sm text-paper/70">
              Entre para guardar seus favoritos, acompanhar pedidos e registrar suas peças.
            </p>
          </div>
        </div>

        <div className="flex min-h-full flex-col px-6 py-8 sm:px-12">
          <div className="flex items-center justify-between">
            <Link href="/" aria-label="PIQUE, ir para a home">
              <Image src="/images/logo-horizontal.png" alt="PIQUE" width={110} height={44} className="h-11 w-auto" />
            </Link>
            <Link href="/" className="text-[12px] font-semibold tracking-[0.1em] text-paper/55 transition-colors hover:text-paper">
              ← VOLTAR À LOJA
            </Link>
          </div>
          <div className="flex flex-1 flex-col justify-center py-10">
            <div className="mx-auto w-full max-w-sm">
              <h1 className="mb-8 font-display text-3xl tracking-wide sm:text-4xl">BEM-VINDO À PIQUE</h1>
              <AuthForms />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <AccountDashboard customer={customer} />;
}
