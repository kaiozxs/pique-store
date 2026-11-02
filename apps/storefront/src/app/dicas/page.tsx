import type { Metadata } from "next";
import Link from "next/link";
import { listTips } from "@/lib/catalogo";

export const metadata: Metadata = { title: "QG — PIQUE" };

export default async function DicasPage() {
  const tips = await listTips();

  return (
    <div className="bg-ink text-paper">
      <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8">
        <div className="mb-4 text-[13px] font-semibold tracking-[0.28em] text-paper/55">DICAS</div>
        <h1 className="mb-6 font-display text-3xl tracking-wide sm:text-5xl">QG</h1>
        <p className="mb-14 text-sm text-paper/55">
          Precisa de ajuda com pedido, troca ou entrega?{" "}
          <Link href="/ajuda" className="font-bold text-paper underline underline-offset-4 hover:text-accent">
            Fale com o atendimento
          </Link>
        </p>

        {tips.length === 0 ? (
          <div className="pb-24 text-sm text-paper/55">Nenhuma dica publicada ainda.</div>
        ) : (
          <div className="grid grid-cols-1 gap-10 pb-24 sm:grid-cols-3">
            {tips.map((tip) => (
              <Link key={tip.slug} href={`/dicas/${tip.slug}`} className="group block">
                <div className="mb-5 aspect-video border border-dashed border-white/20 bg-[#161617]" />
                <h2 className="text-base font-bold leading-snug transition-colors group-hover:text-accent">
                  {tip.title}
                </h2>
                {tip.excerpt && <p className="mt-2 text-sm leading-relaxed text-paper/55">{tip.excerpt}</p>}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
