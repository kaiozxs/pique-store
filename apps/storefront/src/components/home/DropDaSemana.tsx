import Link from "next/link";
import { listProducts } from "@/lib/medusa";
import { ProductCard } from "@/components/ProductCard";

export async function DropDaSemana() {
  const { products, region } = await listProducts();
  const destaques = products.slice(0, 4);

  return (
    <section id="drop" className="bg-ink text-paper">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:px-8 sm:py-32">
        <div className="mb-16 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="mb-4 text-[13px] font-semibold tracking-[0.28em] text-paper/55">
              PRIMEIRA COLEÇÃO
            </div>
            <h2 className="font-display text-3xl tracking-tight sm:text-5xl">DROP DA SEMANA</h2>
          </div>
        </div>

        {destaques.length === 0 ? (
          <div className="text-sm text-paper/55">Nenhum produto publicado ainda no painel.</div>
        ) : (
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4">
            {destaques.map((product) => (
              <ProductCard key={product.id} product={product} region={region} />
            ))}
          </div>
        )}

        <div className="mt-16 flex justify-center">
          <Link
            href="/drops"
            className="border border-white/35 px-10 py-[18px] text-[13px] font-bold tracking-[0.14em] transition-colors hover:border-accent hover:text-accent"
          >
            VER COLEÇÃO COMPLETA
          </Link>
        </div>
      </div>
    </section>
  );
}
