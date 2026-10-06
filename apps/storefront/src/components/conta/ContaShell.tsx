import type { ReactNode } from "react";
import Link from "next/link";
import { fotoDoCliente, getCurrentCustomer, idPessoal } from "@/lib/customer";
import { logoutAction } from "@/app/conta/actions";
import { Avatar } from "./Avatar";
import { ContaNav } from "./ContaNav";
import { ContaSidebar } from "./ContaSidebar";

/**
 * Moldura das páginas da conta.
 *
 * A conta deixou de ser uma página só e virou um conjunto: dados, pedidos,
 * endereços, favoritos e autenticidade. A navegação fica visível em todas
 * elas, senão a pessoa entra num pedido e não acha o caminho de volta pro
 * resto da conta sem passar pelo menu do topo.
 */
export async function ContaShell({
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
  const customer = await getCurrentCustomer();
  const nome = customer ? [customer.first_name, customer.last_name].filter(Boolean).join(" ") || customer.email : "";

  return (
    <div className="bg-ink text-paper">
      <div className="mx-auto flex max-w-6xl gap-10 px-6 py-14 sm:px-8">
        {customer && (
          <ContaSidebar
            topo={
              <Link href="/conta" className="flex items-center gap-3 border border-white/12 p-4 transition-colors hover:border-white/30">
                <Avatar foto={fotoDoCliente(customer)} nome={nome} tamanho={48} />
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{nome}</div>
                  <div className="text-[11px] tracking-[0.14em] text-paper/45">{idPessoal(customer)}</div>
                </div>
              </Link>
            }
            rodape={
              <form action={logoutAction}>
                {/* Parece botão antes mesmo do hover (borda e seta) e responde ao
                    mouse: preenche de vermelho, a seta anda e o cursor vira mão. */}
                <button
                  type="submit"
                  className="toque-leve group flex w-full cursor-pointer items-center justify-between border border-white/15 px-4 py-3 text-[12px] font-semibold tracking-[0.1em] text-paper/70 transition-all duration-200 hover:border-accent hover:bg-accent hover:text-paper"
                >
                  SAIR DA CONTA
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  >
                    <path d="M9 4H5v16h4M15 8l4 4-4 4M19 12H9" />
                  </svg>
                </button>
              </form>
            }
          />
        )}
        <div className="min-w-0 flex-1">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-2 text-[13px] font-semibold tracking-[0.28em] text-paper/50">CONTA</div>
            <h1 className="font-display text-3xl tracking-wide sm:text-4xl">{titulo.toUpperCase()}</h1>
            {descricao && <p className="mt-3 max-w-lg text-sm text-paper/55">{descricao}</p>}
          </div>
          {acao}
        </div>

        <div className="md:hidden">
          <ContaNav />
        </div>

        <div className="mt-9">{children}</div>
        </div>
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
