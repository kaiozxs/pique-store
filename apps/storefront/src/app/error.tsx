"use client";

import Link from "next/link";

/**
 * Tela de erro das páginas. Sem ela, qualquer falha ao falar com o servidor
 * mostrava o erro cru do Next — o que, para um cliente, parece que o site
 * caiu. Aqui ele ganha uma saída: tentar de novo ou voltar para a home.
 */
export default function Erro({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-ink px-6 text-center text-paper">
      <div className="mb-4 text-[13px] font-semibold tracking-[0.28em] text-accent">ALGO DEU ERRADO</div>
      <h1 className="font-display text-3xl tracking-wide sm:text-5xl">NÃO CONSEGUIMOS CARREGAR AGORA</h1>
      <p className="mt-5 max-w-md text-sm leading-relaxed text-paper/60">
        Foi uma falha momentânea. Tente de novo — se continuar, volte à página inicial.
      </p>
      <div className="mt-9 flex flex-wrap justify-center gap-4">
        <button
          type="button"
          onClick={reset}
          className="btn-preenche border border-accent px-8 py-4 text-[13px] font-bold tracking-[0.14em]"
        >
          TENTAR DE NOVO
        </button>
        <Link
          href="/"
          className="border border-white/30 px-8 py-4 text-[13px] font-bold tracking-[0.14em] transition-colors hover:border-white"
        >
          IR PARA A HOME
        </Link>
      </div>
    </div>
  );
}
