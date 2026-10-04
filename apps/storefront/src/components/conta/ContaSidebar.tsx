"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const ic = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const ITENS: { href: string; label: string; icone: ReactNode }[] = [
  { href: "/conta", label: "Minha conta", icone: <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0" {...ic} /> },
  { href: "/conta/pedidos", label: "Meus pedidos", icone: <path d="M4 7l8-4 8 4v10l-8 4-8-4V7Zm0 0 8 4m0 0 8-4m-8 4v10" {...ic} /> },
  { href: "/conta/favoritos", label: "Favoritos", icone: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" {...ic} /> },
  { href: "/conta/colecoes", label: "Minhas coleções", icone: <path d="M4 5h16v14H4V5Zm0 5h16M9 5v14" {...ic} /> },
  { href: "/conta/enderecos", label: "Endereços", icone: <path d="M12 21s-6-5.3-6-10a6 6 0 1 1 12 0c0 4.7-6 10-6 10Zm0-8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" {...ic} /> },
  { href: "/verifique", label: "Verifique seu PIQUE", icone: <path d="M12 3l7 3v5c0 4.4-3 8-7 10-4-2-7-5.6-7-10V6l7-3Zm-3 9 2 2 4-4" {...ic} /> },
];

/**
 * Menu lateral da conta (desktop). Item ativo marcado por barra vermelha e
 * fundo sutil — preto, vermelho e branco, sem cor nova. No celular a
 * navegação é a faixa horizontal de ContaNav, que cabe melhor na mão.
 */
export function ContaSidebar({ topo, rodape }: { topo: ReactNode; rodape: ReactNode }) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-64 md:shrink-0 md:flex-col md:gap-6">
      <div className="sticky top-24 flex flex-col gap-6">
        {topo}
        <nav aria-label="Conta" className="flex flex-col gap-0.5">
          {ITENS.map((item) => {
            const ativo = item.href === "/conta" ? pathname === "/conta" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={ativo ? "page" : undefined}
                className={`toque-leve group relative flex items-center gap-3 px-4 py-3 text-[13px] font-semibold tracking-[0.04em] transition-colors ${
                  ativo ? "bg-white/[0.07] text-paper" : "text-paper/55 hover:bg-white/[0.04] hover:text-paper"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute inset-y-0 left-0 w-[3px] bg-accent transition-transform duration-200 origin-center ${
                    ativo ? "scale-y-100" : "scale-y-0 group-hover:scale-y-50"
                  }`}
                />
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" className={ativo ? "text-accent" : ""}>
                  {item.icone}
                </svg>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 pt-4">{rodape}</div>
      </div>
    </aside>
  );
}
