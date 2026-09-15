import Image from "next/image";
import Link from "next/link";
import type { NavCategory } from "@/lib/medusa";
import { listNavCategories, listProducts } from "@/lib/medusa";

function CollectionTile({ category, thumbnail }: { category: NavCategory; thumbnail?: string }) {
  const badge = (
    <span
      className={`absolute right-4 top-4 border px-2.5 py-1 text-[10px] font-bold tracking-[0.14em] ${
        category.available ? "border-accent bg-accent/90 text-paper" : "border-paper/30 bg-ink/70 text-paper/70"
      }`}
    >
      {category.available ? `${category.product_count} PEÇA${category.product_count === 1 ? "" : "S"}` : "EM BREVE"}
    </span>
  );

  const background = thumbnail ? (
    <Image
      src={thumbnail}
      alt={category.name}
      fill
      className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
    />
  ) : (
    <div
      aria-hidden="true"
      className="absolute inset-0 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.06)_0px,rgba(255,255,255,0.06)_2px,transparent_2px,transparent_18px)] bg-[#161617]"
    />
  );

  const label = (
    <div className="relative p-6">
      <div className="font-display text-2xl leading-none tracking-wide sm:text-3xl">
        {category.name.toUpperCase()}
      </div>
      {category.available && (
        <div className="mt-2 flex items-center gap-2 text-[11px] font-bold tracking-[0.12em] text-accent opacity-0 transition-opacity group-hover:opacity-100">
          EXPLORAR →
        </div>
      )}
    </div>
  );

  if (!category.available) {
    return (
      <div className="group relative flex aspect-[3/4] cursor-default flex-col justify-end overflow-hidden border border-white/10">
        {background}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent" />
        {badge}
        {label}
      </div>
    );
  }

  return (
    <Link
      href={`/drops?categoria=${category.handle}`}
      className="group relative flex aspect-[3/4] flex-col justify-end overflow-hidden border border-white/10"
    >
      {background}
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent" />
      {badge}
      {label}
    </Link>
  );
}

export async function Collections() {
  const [categories, { products }] = await Promise.all([listNavCategories(), listProducts()]);

  const thumbnailByCategory = new Map<string, string>();
  for (const product of products) {
    // Prefere uma foto de lifestyle (modelo vestindo) às fotos de produto —
    // ficam muito cortadas/zoom no card alto da vitrine de coleções.
    const lifestylePhoto = (product.images ?? []).find((img) => img.url?.includes("lifestyle-"))?.url;
    const photo = lifestylePhoto ?? product.thumbnail;
    for (const category of product.categories ?? []) {
      if (!thumbnailByCategory.has(category.id) && photo) {
        thumbnailByCategory.set(category.id, photo);
      }
    }
  }

  if (categories.length === 0) return null;

  return (
    <section className="bg-ink text-paper">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:px-8 sm:py-32">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <h2 className="font-display text-4xl tracking-wide sm:text-6xl">COLEÇÕES</h2>
          <div className="max-w-xs text-sm text-paper/55">
            Cada peça carrega o mesmo padrão. Explore por categoria — o que ainda não chegou, chega.
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <CollectionTile key={category.id} category={category} thumbnail={thumbnailByCategory.get(category.id)} />
          ))}
        </div>
      </div>
    </section>
  );
}
