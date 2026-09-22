import Link from "next/link";
import { listTips } from "@/lib/medusa";
import { Reveal } from "@/components/motion/Reveal";

export async function DicasDestaque() {
  const tips = (await listTips()).slice(0, 3);

  if (tips.length === 0) return null;

  return (
    <section id="dicas" className="bg-ink text-paper">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:px-8 sm:py-32">
        <Reveal className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <div className="text-[13px] font-semibold tracking-[0.28em] text-paper/55">DICAS</div>
          <Link href="/dicas" className="text-[13px] font-bold tracking-[0.1em] hover:text-accent">
            VER TODAS →
          </Link>
        </Reveal>
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          {tips.map((tip, index) => (
            <Reveal key={tip.slug} delay={index * 110}>
            <Link href={`/dicas/${tip.slug}`} className="group block">
              <div className="mb-5 aspect-video border border-dashed border-white/20 bg-[#161617]" />
              <h3 className="text-base font-bold leading-snug transition-colors group-hover:text-accent">
                {tip.title}
              </h3>
              {tip.excerpt && <p className="mt-2 text-sm leading-relaxed text-paper/55">{tip.excerpt}</p>}
            </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
