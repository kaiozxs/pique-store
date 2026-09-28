"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// A mesma lista que aparece no menu do perfil, no topo. Duas entradas pro
// mesmo lugar: quem está navegando dentro da conta não precisa voltar pro
// menu do cabeçalho a cada troca de seção.
export const SECOES_DA_CONTA = [
  { href: "/conta", label: "MINHA CONTA" },
  { href: "/conta/pedidos", label: "MEUS PEDIDOS" },
  { href: "/conta/favoritos", label: "FAVORITOS" },
  { href: "/conta/enderecos", label: "ENDEREÇOS" },
  { href: "/verifique", label: "VERIFIQUE SEU PIQUE" },
];

export function ContaNav() {
  const pathname = usePathname();

  return (
    <nav className="-mx-1 flex gap-1 overflow-x-auto border-y border-white/10 py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {SECOES_DA_CONTA.map((secao) => {
        // "/conta" bate com tudo se usar startsWith — ela só é a ativa quando
        // é exatamente a rota atual.
        const ativa =
          secao.href === "/conta" ? pathname === "/conta" : pathname.startsWith(secao.href);

        return (
          <Link
            key={secao.href}
            href={secao.href}
            aria-current={ativa ? "page" : undefined}
            className={`whitespace-nowrap px-4 py-2.5 text-[12px] font-semibold tracking-[0.08em] transition-colors ${
              ativa ? "bg-accent text-paper" : "text-paper/50 hover:bg-white/5 hover:text-paper"
            }`}
          >
            {secao.label}
          </Link>
        );
      })}
    </nav>
  );
}
