"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { MedusaProduct, MedusaRegion } from "@/lib/medusa";
import { ProductCard } from "@/components/ProductCard";
import { toggleFavoriteAction } from "../actions";

/**
 * Card do favorito com o botão de tirar da lista.
 *
 * Sem ele, a única forma de desfavoritar era abrir o produto e clicar no
 * coração de novo — caminho longo pra uma ação que a pessoa quer fazer
 * justamente enquanto olha a lista.
 */
export function FavoritoCard({
  product,
  region,
}: {
  product: MedusaProduct;
  region: MedusaRegion;
}) {
  const router = useRouter();
  const [removendo, startRemover] = useTransition();

  return (
    <div className={removendo ? "pointer-events-none opacity-40" : undefined}>
      <ProductCard product={product} region={region} />
      <button
        type="button"
        disabled={removendo}
        onClick={() =>
          startRemover(async () => {
            await toggleFavoriteAction(product.handle);
            router.refresh();
          })
        }
        className="mt-2 text-[11px] font-semibold tracking-[0.08em] text-paper/45 transition-colors hover:text-accent"
      >
        {removendo ? "REMOVENDO..." : "REMOVER DOS FAVORITOS"}
      </button>
    </div>
  );
}
