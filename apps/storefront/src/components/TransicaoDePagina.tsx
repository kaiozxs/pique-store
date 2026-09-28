"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";

/**
 * Dá um respiro à troca de páginas.
 *
 * Sem isso a navegação acontece num estalo: a página some e a outra aparece
 * já pronta, sem nada que ligue uma à outra. O cliente descreveu como "não
 * parece que carregou, parece que aconteceu rápido demais" — é exatamente a
 * falta de um gesto de chegada.
 *
 * O conteúdo novo entra clareando e subindo alguns pixels, em 260ms. Curto de
 * propósito: transição de página é uma das coisas que mais irrita quando
 * demora, porque acontece o tempo todo.
 *
 * Só a classe é trocada, sem remontar nada — usar o caminho como `key`
 * destruiria e recriaria a árvore a cada navegação, e aí campo preenchido,
 * rolagem e foco se perderiam.
 */
export function TransicaoDePagina({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const primeiraVez = useRef(true);

  useEffect(() => {
    // Na abertura do site o conteúdo já chega com a página; animar aqui só
    // atrasaria a primeira leitura.
    if (primeiraVez.current) {
      primeiraVez.current = false;
      return;
    }

    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Reinicia a animação mesmo quando a classe já está aplicada.
    el.classList.remove("pagina-entra");
    void el.offsetWidth;
    el.classList.add("pagina-entra");
  }, [pathname]);

  return <div ref={ref}>{children}</div>;
}
