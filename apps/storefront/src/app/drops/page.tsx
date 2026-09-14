import type { Metadata } from "next";
import { listProducts } from "@/lib/medusa";
import { ProductCard } from "@/components/ProductCard";

export const metadata: Metadata = {
  title: "Drops — PIQUE",
};

export default async function DropsPage() {
  const { products, region } = await listProducts();

  return (
    <div className="bg-ink text-paper">
      <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8">
        <div className="mb-4 text-[13px] font-semibold tracking-[0.28em] text-paper/55">CATÁLOGO</div>
        <h1 className="mb-10 font-display text-3xl tracking-tight sm:text-5xl">TODOS OS DROPS</h1>

        <div className="mb-14 flex flex-col gap-4 border-y border-white/10 py-5 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex max-w-md flex-1 items-center gap-3 border border-white/20 px-4 py-3">
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" className="text-paper/50">
              <path
                d="M10 4a6 6 0 1 0 0 12 6 6 0 0 0 0-12ZM20 20l-4.35-4.35"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
            <span className="sr-only">Buscar produtos</span>
            <input
              type="search"
              placeholder="Buscar peças..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-paper/40"
            />
          </label>

          <div className="flex flex-wrap gap-3 text-[12px] font-semibold tracking-[0.08em]">
            <button type="button" className="border border-accent bg-accent px-4 py-2 text-paper">
              TODOS
            </button>
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
