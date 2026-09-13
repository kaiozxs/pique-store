const MESSAGE = "PRÉ-LANÇAMENTO — DROP 001 PIQUE — ACESSO ANTECIPADO EM BREVE";

export function Marquee() {
  return (
    <div className="overflow-hidden border-b border-white/10 bg-ink py-2.5 text-accent">
      <div className="flex w-max animate-marquee gap-14">
        <span className="whitespace-nowrap text-xs font-semibold tracking-[0.2em]">
          {MESSAGE} — {MESSAGE}
        </span>
        <span aria-hidden="true" className="whitespace-nowrap text-xs font-semibold tracking-[0.2em]">
          {MESSAGE} — {MESSAGE}
        </span>
      </div>
    </div>
  );
}
