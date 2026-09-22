import Image from "next/image";
import Link from "next/link";

type HeroConfig = {
  headline_line1?: string;
  headline_highlight?: string;
  subtext?: string;
  button_label?: string;
  button_href?: string;
};

// O link do botão vem de um campo de texto livre no admin (Home Configurável)
// sem validação de esquema — sem isso, um "javascript:" ou "data:" ali vira
// XSS armazenado pra todo visitante que clicar no CTA. Só aceita caminho
// relativo (rota interna) ou http(s) absoluto.
function sanitizeHref(href: string): string {
  if (href.startsWith("/") || href.startsWith("#")) return href;
  try {
    const url = new URL(href);
    if (url.protocol === "http:" || url.protocol === "https:") return href;
  } catch {
    // href inválida — cai no fallback abaixo
  }
  return "/drops";
}

export function Hero({ config }: { config?: Record<string, string> | null }) {
  const c: HeroConfig = config ?? {};
  const headlineLine1 = c.headline_line1 || "O PADRÃO É";
  const headlineHighlight = c.headline_highlight || "INCOMPARÁVEL";
  const subtext =
    c.subtext ||
    "Peças desenhadas para quem entende moda como investimento, não como tendência. PIQUE une o corte impecável do alfaiate ao impulso das ruas.";
  const buttonLabel = c.button_label || "EXPLORAR O DROP 001";
  const buttonHref = sanitizeHref(c.button_href || "/drops");

  return (
    <section className="relative overflow-hidden bg-ink text-paper">
      <Image
        src="/images/hero-praia.jpg"
        alt=""
        fill
        priority
        className="object-cover object-[42%_center]"
        sizes="100vw"
      />
      {/* A foto é clara e cheia de cor — texto branco em cima dela sem
          tratamento fica ilegível. Véu leve geral + duas rampas que trocam de
          direção conforme a largura: no desktop o texto ocupa só a coluna da
          esquerda, então a rampa é horizontal e o lado direito (areia, coco,
          chinelo) fica intacto; no celular o texto atravessa a tela inteira,
          aí quem escurece é a rampa vertical — a horizontal ali apagaria a
          foto toda. */}
      <div className="absolute inset-0 bg-ink/25" />
      <div className="absolute inset-0 hidden bg-gradient-to-r from-ink via-ink/75 to-transparent sm:block" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/10 sm:via-ink/20 sm:to-transparent" />

      <div className="relative mx-auto max-w-7xl px-6 py-28 sm:px-8 sm:py-36">
        <div className="mb-7 text-[13px] font-semibold tracking-[0.32em] text-paper/60">
          STREETWEAR DE ALTO PADRÃO
        </div>
        <h1 className="max-w-[16ch] font-display text-[clamp(2.1rem,9vw,6.5rem)] leading-[0.98] tracking-wide drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)]">
          {headlineLine1} <span className="text-accent">{headlineHighlight}</span>
        </h1>
        <p className="mt-9 max-w-lg text-[17px] leading-relaxed text-paper/85">{subtext}</p>
        <div className="mt-12 flex flex-wrap items-center gap-8">
          <Link
            href={buttonHref}
            className="border border-accent bg-accent px-8 py-[18px] text-[13px] font-bold tracking-[0.14em] transition-colors hover:bg-paper hover:text-ink"
          >
            {buttonLabel}
          </Link>
          <Link
            href="#apresentacao"
            className="group relative inline-flex items-center gap-2.5 py-1 text-[13px] font-bold tracking-[0.1em]"
          >
            <span className="transition-colors duration-300 ease-out group-hover:text-accent">
              LER O MANIFESTO
            </span>
            <span
              aria-hidden="true"
              className="text-accent transition-transform duration-300 ease-out group-hover:translate-x-1.5"
            >
              →
            </span>
            {/* Traço que se desenha da esquerda pra direita no hover — o
                origin-left é o que dá a sensação de "riscado a mão" em vez de
                simplesmente aparecer. */}
            <span
              aria-hidden="true"
              className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-accent transition-transform duration-300 ease-out group-hover:scale-x-100"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
