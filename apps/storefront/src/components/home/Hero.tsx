import Link from "next/link";

export function Hero() {
  return (
    <section className="relative bg-ink text-paper">
      <div className="mx-auto max-w-7xl px-6 py-28 sm:px-8 sm:py-36">
        <div className="mb-7 text-[13px] font-semibold tracking-[0.32em] text-paper/60">
          STREETWEAR DE ALTO PADRÃO
        </div>
        <h1 className="max-w-[16ch] font-display text-[clamp(2.1rem,9vw,6.5rem)] leading-[0.98] tracking-tight">
          O PADRÃO É <span className="text-accent">INCOMPARÁVEL</span>
        </h1>
        <p className="mt-9 max-w-lg text-[17px] leading-relaxed text-paper/70">
          Peças desenhadas para quem entende moda como investimento — não como tendência. PIQUE
          une o corte impecável do alfaiate ao impulso das ruas.
        </p>
        <div className="mt-12 flex flex-wrap items-center gap-8">
          <Link
            href="/drops"
            className="border border-accent bg-accent px-8 py-[18px] text-[13px] font-bold tracking-[0.14em] transition-colors hover:bg-paper hover:text-ink"
          >
            EXPLORAR O DROP 001
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
