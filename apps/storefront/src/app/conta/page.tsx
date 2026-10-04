import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getCurrentCustomer } from "@/lib/customer";
import { LoginVitrine } from "@/components/conta/LoginVitrine";
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
      <div className="login-fundo fixed inset-0 z-[55] overflow-y-auto text-paper">
        <div className="flex min-h-full items-center justify-center p-4 sm:p-8">
          <div className="grid w-full max-w-6xl gap-0 rounded-3xl border border-white/10 bg-[#141414] p-3 shadow-[0_30px_90px_rgba(0,0,0,0.6)] lg:min-h-[680px] lg:grid-cols-[1fr_1.1fr]">
            <LoginVitrine />

            <div className="login-suave flex flex-col px-5 py-6 sm:px-10">
              <div className="flex items-center justify-between lg:hidden">
                <Link href="/" aria-label="PIQUE, ir para a home">
                  <Image src="/images/logo-horizontal.png" alt="PIQUE" width={96} height={40} className="h-10 w-auto" />
                </Link>
                <Link href="/" className="rounded-full bg-white/10 px-4 py-2 text-[12px] font-semibold tracking-[0.06em]">
                  Voltar à loja →
                </Link>
              </div>
              <div className="flex flex-1 flex-col justify-center py-8">
                <div className="mx-auto w-full max-w-sm">
                  <div className="mb-3 text-[12px] font-semibold tracking-[0.3em] text-accent">ÁREA DO CLIENTE</div>
                  <h1 className="font-display text-5xl tracking-wide sm:text-6xl">ENTRAR</h1>
                  <p className="mb-8 mt-3 text-sm leading-relaxed text-paper/55">
                    Acompanhe pedidos, salve favoritos e registre suas peças PIQUE.
                  </p>
                  <AuthForms />
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 text-[11px] tracking-[0.12em] text-paper/40">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <rect x="5" y="11" width="14" height="9" rx="2" />
                  <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                </svg>
                COMPRA SEGURA · SEUS DADOS PROTEGIDOS
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <AccountDashboard customer={customer} />;
}
