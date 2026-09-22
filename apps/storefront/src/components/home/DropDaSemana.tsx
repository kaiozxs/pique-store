import Link from "next/link";
import { getCuratedDrop } from "@/lib/medusa";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/motion/Reveal";

export async function DropDaSemana() {
  const { title, products, region } = await getCuratedDrop();

  // Seção é curada pelo painel admin — sem produtos publicados, não mostramos
  // conteúdo de preenchimento nenhum.
  if (products.length === 0) return null;

  return (
    <section id="drop" className="bg-ink text-paper">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:px-8 sm:py-32">
        <Reveal className="mb-16 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="mb-4 text-[13px] font-semibold tracking-[0.28em] text-paper/55">
              PRIMEIRA COLEÇÃO
            </div>
            <h2 className="font-display text-3xl tracking-wide sm:text-5xl">
              {title ?? "DROP DA SEMANA"}
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product, index) => (
            <Reveal key={product.id} delay={index * 90}>
              <ProductCard product={product} region={region} />
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-16 flex justify-center">
          <Link
            href="/drops"
            className="border border-white/35 px-10 py-[18px] text-[13px] font-bold tracking-[0.14em] transition-colors hover:border-accent hover:text-accent"
          >
            VER COLEÇÃO COMPLETA
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
