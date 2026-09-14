import Link from "next/link";

type HeroConfig = {
  headline_line1?: string;
  headline_highlight?: string;
  subtext?: string;
  button_label?: string;
  button_href?: string;
};

export function Hero({ config }: { config?: Record<string, string> | null }) {
  const c: HeroConfig = config ?? {};
  const headlineLine1 = c.headline_line1 || "O PADRÃO É";
  const headlineHighlight = c.headline_highlight || "INCOMPARÁVEL";
  const subtext =
    c.subtext ||
    "Peças desenhadas para quem entende moda como investimento, não como tendência. PIQUE une o corte impecável do alfaiate ao impulso das ruas.";
  const buttonLabel = c.button_label || "EXPLORAR O DROP 001";
  const buttonHref = c.button_href || "/drops";

  return (
    <section className="relative bg-ink text-paper">
      <div className="mx-auto max-w-7xl px-6 py-28 sm:px-8 sm:py-36">
        <div className="mb-7 text-[13px] font-semibold tracking-[0.32em] text-paper/60">
          STREETWEAR DE ALTO PADRÃO
        </div>
        <h1 className="max-w-[16ch] font-display text-[clamp(2.1rem,9vw,6.5rem)] leading-[0.98] tracking-tight">
          {headlineLine1} <span className="text-accent">{headlineHighlight}</span>
        </h1>
        <p className="mt-9 max-w-lg text-[17px] leading-relaxed text-paper/70">{subtext}</p>
        <div className="mt-12 flex flex-wrap items-center gap-8">
          <Link
            href={buttonHref}
            className="border border-accent bg-accent px-8 py-[18px] text-[13px] font-bold tracking-[0.14em] transition-colors hover:bg-paper hover:text-ink"
          >
            {buttonLabel}
          </Link>
          <Link href="#apresentacao" className="inline-flex items-center gap-2.5 text-[13px] font-bold tracking-[0.1em]">
            LER O MANIFESTO
            <span aria-hidden="true" className="text-accent">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
