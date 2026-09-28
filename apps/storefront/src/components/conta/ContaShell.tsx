import Link from "next/link";
import type { ReactNode } from "react";
import { ContaNav } from "./ContaNav";

/**
 * Moldura das páginas da conta.
 *
 * A conta deixou de ser uma página só e virou um conjunto: dados, pedidos,
 * endereços, favoritos e autenticidade. A navegação fica visível em todas
 * elas, senão a pessoa entra num pedido e não acha o caminho de volta pro
 * resto da conta sem passar pelo menu do topo.
 */
export function ContaShell({
  titulo,
  descricao,
  acao,
  children,
}: {
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="bg-ink text-paper">
      <div className="mx-auto max-w-5xl px-6 py-14 sm:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-2 text-[13px] font-semibold tracking-[0.28em] text-paper/50">CONTA</div>
            <h1 className="font-display text-3xl tracking-wide sm:text-4xl">{titulo.toUpperCase()}</h1>
            {descricao && <p className="mt-3 max-w-lg text-sm text-paper/55">{descricao}</p>}
          </div>
          {acao}
        </div>

        <ContaNav />

        <div className="mt-9">{children}</div>
      </div>
    </div>
  );
}

export function ContaVazio({ texto, botao }: { texto: string; botao?: { href: string; label: string } }) {
  return (
    <div className="border border-white/12 px-6 py-12 text-center">
      <p className="text-sm text-paper/55">{texto}</p>
      {botao && (
        <Link
          href={botao.href}
          className="btn-preenche mt-6 inline-block border border-accent px-7 py-3 text-[12px] font-bold tracking-[0.1em]"
        >
          {botao.label}
        </Link>
      )}
    </div>
  );
}
