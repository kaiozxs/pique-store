import Link from "next/link";
import { getCuratedDrop } from "@/lib/medusa";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/motion/Reveal";
import { Vitrine } from "@/components/home/Vitrine";

export async function DropDaSemana() {
  const { title, products, region } = await getCuratedDrop();

  // Seção é curada pelo painel admin — sem produtos publicados, não mostramos
  // conteúdo de preenchimento nenhum.
  if (products.length === 0) return null;

  return (
    <section id="drop" className="bg-ink text-paper">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:px-8 sm:py-28">
        <Reveal className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="mb-4 text-[13px] font-semibold tracking-[0.28em] text-paper/55">
              EM DESTAQUE
            </div>
            <h2 className="font-display text-3xl tracking-wide sm:text-5xl">
              {title ?? "DROPS DA SEMANA"}
            </h2>
          </div>
          <Link
            href="/drops"
            className="group inline-flex items-center gap-2.5 text-[13px] font-bold tracking-[0.12em]"
          >
            <span className="transition-colors duration-300 ease-out group-hover:text-accent">
              VER TODOS
            </span>
            <span
              aria-hidden="true"
              className="text-accent transition-transform duration-300 ease-out group-hover:translate-x-1.5"
            >
              →
            </span>
          </Link>
        </Reveal>

        {/* Largura fixa por peça: é o que faz o próximo card aparecer cortado
            na borda e deixa claro, sem escrever nada, que a lista continua. */}
        <Vitrine>
          {products.map((product) => (
            <div
              key={product.id}
              className="w-[78vw] shrink-0 snap-start sm:w-[300px] lg:w-[302px]"
            >
              <ProductCard product={product} region={region} />
            </div>
          ))}
        </Vitrine>
      </div>
    </section>
  );
}
