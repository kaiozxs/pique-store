"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Trilho horizontal de produtos.
 *
 * A rolagem é a nativa do navegador com encaixe (scroll-snap): funciona com
 * dedo no celular, com roda e trackpad no computador, e com o teclado — as
 * setas são um atalho a mais, não o único jeito de andar. Por isso não entra
 * biblioteca de carrossel aqui: ela traria bem pouco além do que o próprio
 * navegador já faz, e peso é o que menos falta nesta página.
 */
export function Vitrine({ children }: { children: ReactNode }) {
  const trilho = useRef<HTMLDivElement>(null);
  const [podeVoltar, setPodeVoltar] = useState(false);
  const [podeAvancar, setPodeAvancar] = useState(false);

  useEffect(() => {
    const el = trilho.current;
    if (!el) return;

    function medir() {
      const alvo = trilho.current;
      if (!alvo) return;
      // 4px de folga: larguras fracionadas fazem o fim da rolagem não bater
      // exatamente no total, e sem isso a seta da direita nunca apagava.
      setPodeVoltar(alvo.scrollLeft > 4);
      setPodeAvancar(alvo.scrollLeft + alvo.clientWidth < alvo.scrollWidth - 4);
    }

    medir();
    el.addEventListener("scroll", medir, { passive: true });
    window.addEventListener("resize", medir);
    return () => {
      el.removeEventListener("scroll", medir);
      window.removeEventListener("resize", medir);
    };
  }, []);

  function andar(direcao: 1 | -1) {
    const el = trilho.current;
    if (!el) return;
    // Anda quase uma tela cheia, deixando um pedaço do próximo à vista pra
    // não dar a impressão de que a lista acabou.
    el.scrollBy({ left: direcao * el.clientWidth * 0.85, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={trilho}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-2 pb-6 pt-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>

      {/* Setas só no computador: no celular a rolagem é com o dedo, e botão
          sobreposto ali só atrapalharia. */}
      <button
        type="button"
        aria-label="Ver peças anteriores"
        onClick={() => andar(-1)}
        disabled={!podeVoltar}
        className="absolute -left-4 top-[38%] hidden h-11 w-11 items-center justify-center border border-white/25 bg-ink/90 text-lg text-paper transition-all hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-0 lg:flex"
      >
        ←
      </button>
      <button
        type="button"
        aria-label="Ver mais peças"
        onClick={() => andar(1)}
        disabled={!podeAvancar}
        className="absolute -right-4 top-[38%] hidden h-11 w-11 items-center justify-center border border-white/25 bg-ink/90 text-lg text-paper transition-all hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-0 lg:flex"
      >
        →
      </button>
    </div>
  );
}
