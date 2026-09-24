import type { Metadata } from "next";
import Link from "next/link";
import { listNavCategories, listProducts } from "@/lib/medusa";
import { ProductCard } from "@/components/ProductCard";

export const metadata: Metadata = {
  title: "Drops — PIQUE",
};

export default async function DropsPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; q?: string }>;
}) {
  const { categoria, q } = await searchParams;
  const categories = await listNavCategories();
  const activeCategory = categoria ? categories.find((c) => c.handle === categoria) : undefined;
  const { products, region } = await listProducts({ categoryId: activeCategory?.id, q });

  return (
    <div className="bg-ink text-paper">
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 sm:py-14">
        {/* Cabeçalho numa linha só: o título sozinho à esquerda e a palavra
            "catálogo" virando nota discreta do outro lado. Empilhado, ele
            comia altura à toa e empurrava as peças pra fora da primeira tela —
            que é justamente o que a pessoa veio ver. */}
        <div className="mb-7 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <h1 className="font-display text-2xl tracking-wide sm:text-3xl lg:text-4xl">
            {q ? `RESULTADOS PARA "${q.toUpperCase()}"` : activeCategory ? activeCategory.name.toUpperCase() : "TODOS OS DROPS"}
          </h1>
          <div className="text-[12px] font-semibold tracking-[0.22em] text-paper/45">
            CATÁLOGO · {products.length} {products.length === 1 ? "PEÇA" : "PEÇAS"}
          </div>
        </div>

        <div className="mb-9 flex flex-col gap-4 border-y border-white/10 py-4 sm:flex-row sm:items-center sm:justify-between">
          <form action="/drops" className="flex max-w-md flex-1 items-center gap-3 border border-white/20 px-4 py-3">
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" className="text-paper/50">
              <path
                d="M10 4a6 6 0 1 0 0 12 6 6 0 0 0 0-12ZM20 20l-4.35-4.35"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
            <label htmlFor="drops-search" className="sr-only">
              Buscar produtos
            </label>
            <input
              id="drops-search"
              name="q"
              type="search"
              defaultValue={q ?? ""}
              placeholder="Buscar peças..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-paper/40"
            />
          </form>

          <div className="flex flex-wrap gap-3 text-[12px] font-semibold tracking-[0.08em]">
            <Link
              href="/drops"
              className={`border px-4 py-2 transition-colors ${
                !activeCategory ? "border-accent bg-accent text-paper" : "border-white/20 hover:border-white/50"
              }`}
            >
              TODOS
            </Link>
            {categories
              .filter((c) => c.available)
              .map((c) => (
                <Link
                  key={c.id}
                  href={`/drops?categoria=${c.handle}`}
                  className={`border px-4 py-2 uppercase transition-colors ${
                    activeCategory?.id === c.id
                      ? "border-accent bg-accent text-paper"
                      : "border-white/20 hover:border-white/50"
                  }`}
                >
                  {c.name}
                </Link>
              ))}
          </div>
        </div>

        {products.length === 0 ? (
          <div className="pb-24 text-sm text-paper/55">
            Nenhum produto publicado ainda. Cadastre produtos no painel administrativo do Medusa
            para eles aparecerem aqui.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-7 pb-24 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} region={region} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
