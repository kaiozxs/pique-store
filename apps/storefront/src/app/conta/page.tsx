import type { Metadata } from "next";

export const metadata: Metadata = { title: "Entrar — PIQUE" };

export default function ContaPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-paper px-6 text-center text-ink">
      <div className="mb-4 text-[13px] font-semibold tracking-[0.28em] text-ink/50">CONTA</div>
      <h1 className="font-display text-3xl tracking-tight sm:text-5xl">EM DESENVOLVIMENTO</h1>
      <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-ink/60">
        Criação de conta, login, pedidos, endereços e favoritos chegam junto com a integração do
        painel administrativo.
      </p>
    </div>
  );
}
