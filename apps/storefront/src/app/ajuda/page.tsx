import type { Metadata } from "next";
import { getFaqCategories } from "@/lib/medusa";

export const metadata: Metadata = { title: "Ajuda — PIQUE" };

export default async function AjudaPage() {
  const categorias = await getFaqCategories();

  return (
    <div className="bg-ink text-paper">
      <div className="mx-auto max-w-3xl px-6 py-20 sm:px-8">
        <div className="mb-4 text-[13px] font-semibold tracking-[0.28em] text-paper/55">SUPORTE</div>
        <h1 className="mb-14 font-display text-3xl tracking-tight sm:text-5xl">AJUDA</h1>

        {categorias.length === 0 ? (
          <div className="pb-24 text-sm text-paper/55">Nenhuma pergunta publicada ainda.</div>
        ) : (
          <div className="flex flex-col gap-12 pb-24">
            {categorias.map((categoria) => (
              <div key={categoria.title}>
                <h2 className="mb-4 text-sm font-extrabold tracking-[0.06em] text-paper/70">
                  {categoria.title.toUpperCase()}
                </h2>
                <div className="flex flex-col divide-y divide-white/10 border-y border-white/10">
                  {categoria.items.map((item) => (
                    <details key={item.question} className="group py-4">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold">
                        {item.question}
                        <span className="text-accent transition-transform group-open:rotate-45">+</span>
                      </summary>
                      <p className="mt-3 text-sm leading-relaxed text-paper/60">{item.answer}</p>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
