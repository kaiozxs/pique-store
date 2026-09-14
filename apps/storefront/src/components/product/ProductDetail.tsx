"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { MedusaProduct, MedusaRegion } from "@/lib/medusa";
import { findVariant, formatMoney, isVariantAvailable } from "@/lib/medusa";

const GARMENT_ICON_PATH =
  "M4 7.2 L8.2 4 L10 5.6 L14 5.6 L15.8 4 L20 7.2 L17.8 10.4 L16 9.3 L16 20 L8 20 L8 9.3 L6.2 10.4 Z";

export function ProductDetail({ product, region }: { product: MedusaProduct; region: MedusaRegion }) {
  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const option of product.options ?? []) {
      const firstValue = option.values?.[0];
      if (firstValue) initial[option.title] = firstValue.value;
    }
    return initial;
  });
  const [favorito, setFavorito] = useState(false);

  const variante = useMemo(() => findVariant(product, selected), [product, selected]);

  const disponivel = variante ? isVariantAvailable(variante) : false;
  const image = product.thumbnail ?? product.images?.[0]?.url;

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-16 px-6 py-16 sm:px-8 lg:grid-cols-2 lg:gap-20">
      <div className="flex flex-col gap-4">
        <div className="relative flex aspect-[3/4] flex-col items-center justify-center gap-4 overflow-hidden border border-dashed border-white/20 bg-[#161617]">
          {image ? (
            <Image src={image} alt={product.title} fill className="object-cover" sizes="(min-width: 1024px) 50vw, 100vw" />
          ) : (
            <>
              <svg width="72" height="72" viewBox="0 0 24 24" aria-hidden="true" className="text-paper/30">
                <path d={GARMENT_ICON_PATH} fill="none" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" strokeLinecap="round" />
              </svg>
              <div className="text-xs tracking-[0.08em] text-paper/45">[FOTOS DO PRODUTO]</div>
            </>
          )}
        </div>
      </div>

      <div>
        <h1 className="font-display text-3xl tracking-tight sm:text-4xl">{product.title}</h1>

        <div className="mt-5 text-xl font-semibold">
          {variante?.calculated_price?.calculated_amount != null && variante.calculated_price.currency_code
            ? formatMoney(variante.calculated_price.calculated_amount, variante.calculated_price.currency_code)
            : "[preço indisponível]"}
        </div>

        {product.description && (
          <p className="mt-7 text-sm leading-relaxed text-paper/70">{product.description}</p>
        )}

        {(product.options ?? []).map((option) => (
          <div key={option.title} className="mt-8">
            <div className="mb-2 text-xs font-bold tracking-[0.1em] text-paper/60">
              {option.title.toUpperCase()}
            </div>
            <div className="flex flex-wrap gap-2">
              {(option.values ?? []).map((v) => (
                <button
                  key={v.value}
                  type="button"
                  onClick={() => setSelected((prev) => ({ ...prev, [option.title]: v.value }))}
                  className={`border px-4 py-2 text-sm transition-colors ${
                    selected[option.title] === v.value
                      ? "border-accent text-accent"
                      : "border-white/25 hover:border-white/50"
                  }`}
                >
                  {v.value}
                </button>
              ))}
            </div>
          </div>
        ))}

        {!disponivel && (
          <div className="mt-4 text-xs font-semibold tracking-[0.05em] text-paper/50">
            INDISPONÍVEL nesta combinação.
          </div>
        )}

        <div className="mt-9 flex flex-wrap items-center gap-4">
          <button
            type="button"
            disabled={!disponivel}
            className="border border-accent bg-accent px-8 py-4 text-[13px] font-bold tracking-[0.12em] text-paper transition-colors hover:bg-paper hover:text-ink disabled:cursor-not-allowed disabled:border-white/20 disabled:bg-transparent disabled:text-paper/40 disabled:hover:bg-transparent disabled:hover:text-paper/40"
          >
            {disponivel ? "ADICIONAR À SACOLA" : "INDISPONÍVEL"}
          </button>
          <button
            type="button"
            onClick={() => setFavorito((f) => !f)}
            aria-pressed={favorito}
            className={`border px-5 py-4 text-[13px] font-bold tracking-[0.1em] transition-colors ${
              favorito ? "border-accent text-accent" : "border-white/25 hover:border-white/50"
            }`}
          >
            {favorito ? "★ FAVORITADO" : "☆ FAVORITAR"}
          </button>
        </div>
      </div>
    </div>
  );
}
