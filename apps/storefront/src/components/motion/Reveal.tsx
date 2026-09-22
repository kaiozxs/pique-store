"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

// Fração da altura da janela em que o elemento é considerado "na tela". Menor
// que 1 de propósito: dispara um pouco antes de ele encostar na borda de baixo,
// senão a animação acontece no canto do olho e não se vê.
const TRIGGER_RATIO = 0.9;

// Um único listener de scroll pra página inteira, em vez de um por seção, e a
// checagem é agrupada num timer — rolar rápido não dispara dezenas de
// recálculos de layout. Timer e não requestAnimationFrame de propósito: quadro
// de animação não roda em aba oculta ou sem composição, e ali a rolagem ainda
// acontece (restauração de posição, link com âncora, aba aberta em segundo
// plano). Com rAF o conteúdo dessas páginas ficaria escondido pra sempre.
const pending = new Set<HTMLElement>();
let scheduled = 0;
let listening = false;

function check() {
  scheduled = 0;
  const limit = window.innerHeight * TRIGGER_RATIO;
  for (const el of pending) {
    if (el.getBoundingClientRect().top <= limit) {
      el.dataset.reveal = "shown";
      pending.delete(el);
    }
  }
  if (pending.size === 0) stopListening();
}

function schedule() {
  if (scheduled) return;
  scheduled = window.setTimeout(check, 0);
}

function startListening() {
  if (listening) return;
  listening = true;
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  // Aba que estava em segundo plano (ou página voltando do cache do botão
  // "voltar") pode ter rolado sem disparar nada: quando ela reaparece, recheca
  // do zero em vez de confiar no que ficou pendente.
  document.addEventListener("visibilitychange", schedule);
  window.addEventListener("pageshow", schedule);
}

function stopListening() {
  if (!listening) return;
  listening = false;
  window.removeEventListener("scroll", schedule);
  window.removeEventListener("resize", schedule);
  document.removeEventListener("visibilitychange", schedule);
  window.removeEventListener("pageshow", schedule);
}

function watch(el: HTMLElement) {
  pending.add(el);
  startListening();
  schedule();
}

function unwatch(el: HTMLElement) {
  pending.delete(el);
  if (pending.size === 0) stopListening();
}

/**
 * Faz o conteúdo surgir quando ele entra na tela durante a rolagem.
 *
 * O estado escondido é aplicado pelo JS, nunca pelo HTML que sai do servidor:
 * se o script falhar, for bloqueado, ou o visitante navegar sem JS, a página
 * continua visível do mesmo jeito — o efeito é enfeite, não pode ser a única
 * coisa que faz o texto aparecer (buscador lendo página em branco é perda de
 * venda).
 *
 * Também não esconde nada que já esteja na tela no primeiro quadro: quem abre
 * o site vê a página pronta, sem aquele pisca-esconde-aparece de quem anima
 * tudo de uma vez.
 */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Quem pediu menos movimento no sistema não recebe nenhum.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Janela sem altura (aba renderizando fora de tela, painel embutido
    // escondido): nada nunca entraria na tela e o conteúdo ficaria invisível
    // pra sempre. Melhor não animar.
    if (window.innerHeight === 0) return;

    // Já está visível na abertura? Fica como está.
    if (el.getBoundingClientRect().top <= window.innerHeight * TRIGGER_RATIO) return;

    el.dataset.reveal = "hidden";
    watch(el);

    return () => {
      unwatch(el);
      // Devolve o elemento ao estado visível ao desmontar: se o efeito parar no
      // meio (troca de página, recarga de componente), nada pode ficar preso
      // escondido no DOM.
      if (el.dataset.reveal === "hidden") delete el.dataset.reveal;
    };
  }, []);

  return (
    <div ref={ref} className={className} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </div>
  );
}
