"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

// Fração da altura da janela em que o elemento é considerado "na tela". Menor
// que 1 de propósito: dispara um pouco antes de ele encostar na borda de baixo,
// senão a animação acontece no canto do olho e não se vê.
const TRIGGER_RATIO = 0.9;

// Três gatilhos para a mesma checagem, de propósito.
//
// O primeiro era só o evento de rolagem da janela, e isso escondia conteúdo de
// verdade: dentro do navegador embutido de apps (o do Google, por exemplo) e
// em qualquer página cuja rolagem acontece num elemento interno, esse evento
// nunca chega — as seções entravam escondidas e não voltavam nunca. Então:
//
//   1. IntersectionObserver, que observa a tela e não depende de quem rola;
//   2. os eventos de rolagem/redimensionamento, como reforço;
//   3. um pulso de 1 em 1 segundo enquanto houver pendentes, que é a rede de
//      segurança final — mesmo que 1 e 2 falhem os dois, o conteúdo aparece.
//
// O pulso para sozinho assim que tudo foi revelado, e desiste depois de 20
// tentativas pra não ficar rodando pra sempre numa aba esquecida aberta.
const pendentes = new Set<HTMLElement>();
let agendado = 0;
let ouvindo = false;
let observador: IntersectionObserver | null = null;
let pulso: ReturnType<typeof setInterval> | null = null;
let batidas = 0;

const PULSOS_MAX = 20;

function revelar(el: HTMLElement) {
  el.dataset.reveal = "shown";
  pendentes.delete(el);
  observador?.unobserve(el);
}

function check() {
  agendado = 0;
  const limite = window.innerHeight * TRIGGER_RATIO;
  for (const el of pendentes) {
    if (el.getBoundingClientRect().top <= limite) revelar(el);
  }
  if (pendentes.size === 0) pararTudo();
}

function schedule() {
  if (agendado) return;
  agendado = window.setTimeout(check, 0);
}

function garantirObservador() {
  if (observador || typeof IntersectionObserver === "undefined") return;
  observador = new IntersectionObserver(
    (entradas) => {
      for (const entrada of entradas) {
        if (entrada.isIntersecting) revelar(entrada.target as HTMLElement);
      }
      if (pendentes.size === 0) pararTudo();
    },
    { rootMargin: "0px 0px -10% 0px" }
  );
}

function comecarAOuvir() {
  if (ouvindo) return;
  ouvindo = true;
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  document.addEventListener("visibilitychange", schedule);
  window.addEventListener("pageshow", schedule);
  // Rolagem que acontece dentro de um elemento não emite evento na janela,
  // mas emite na fase de captura do documento.
  document.addEventListener("scroll", schedule, { passive: true, capture: true });

  batidas = 0;
  pulso = setInterval(() => {
    batidas += 1;
    check();
    if (batidas >= PULSOS_MAX) {
      // Desistir escondendo seria o pior desfecho: revela o que sobrou.
      for (const el of [...pendentes]) revelar(el);
      pararTudo();
    }
  }, 1000);
}

function pararTudo() {
  if (pulso) {
    clearInterval(pulso);
    pulso = null;
  }
  if (!ouvindo) return;
  ouvindo = false;
  window.removeEventListener("scroll", schedule);
  window.removeEventListener("resize", schedule);
  document.removeEventListener("visibilitychange", schedule);
  window.removeEventListener("pageshow", schedule);
  document.removeEventListener("scroll", schedule, { capture: true } as EventListenerOptions);
}

function watch(el: HTMLElement) {
  pendentes.add(el);
  garantirObservador();
  observador?.observe(el);
  comecarAOuvir();
  schedule();
}

function unwatch(el: HTMLElement) {
  pendentes.delete(el);
  observador?.unobserve(el);
  if (pendentes.size === 0) pararTudo();
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
