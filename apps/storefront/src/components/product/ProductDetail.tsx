"use client";

import Image from "next/image";
import { useMemo, useState, useTransition } from "react";
import type { MedusaProduct, MedusaRegion } from "@/lib/medusa";
import { findVariant, formatMoney, getPresaleInfo, isVariantAvailable } from "@/lib/medusa";
import { addToCartAction } from "@/lib/cart-actions";

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
  const [quantidade, setQuantidade] = useState(1);
  const [feedback, setFeedback] = useState<"ok" | "erro" | null>(null);
  const [isPending, startTransition] = useTransition();

  const variante = useMemo(() => findVariant(product, selected), [product, selected]);

  const disponivel = variante ? isVariantAvailable(variante) : false;
  const gallery = useMemo(() => {
    const urls = (product.images ?? []).map((img) => img.url).filter(Boolean) as string[];
    if (urls.length > 0) return urls;
    return product.thumbnail ? [product.thumbnail] : [];
  }, [product]);
  const [activeImage, setActiveImage] = useState(0);
  const image = gallery[activeImage] ?? gallery[0];
  const presale = getPresaleInfo(product);

  function handleAddToCart() {
    if (!variante) return;
    setFeedback(null);
    startTransition(async () => {
      const result = await addToCartAction(variante.id, quantidade);
      setFeedback(result.ok ? "ok" : "erro");
    });
  }

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-16 px-6 py-16 sm:px-8 lg:grid-cols-2 lg:gap-20">
      <div className="flex flex-col gap-4">
        <div className="relative flex aspect-[3/4] flex-col items-center justify-center gap-4 overflow-hidden border border-dashed border-white/20 bg-[#161617]">
          {image ? (
            <Image
              key={image}
              src={image}
              alt={product.title}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
              priority={activeImage === 0}
            />
          ) : (
            <>
              <svg width="72" height="72" viewBox="0 0 24 24" aria-hidden="true" className="text-paper/30">
                <path d={GARMENT_ICON_PATH} fill="none" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" strokeLinecap="round" />
              </svg>
              <div className="text-xs tracking-[0.08em] text-paper/45">[FOTOS DO PRODUTO]</div>
            </>
          )}

          {gallery.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Foto anterior"
                onClick={() => setActiveImage((i) => (i - 1 + gallery.length) % gallery.length)}
                className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center bg-ink/60 text-paper transition-colors hover:bg-accent"
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Próxima foto"
                onClick={() => setActiveImage((i) => (i + 1) % gallery.length)}
                className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center bg-ink/60 text-paper transition-colors hover:bg-accent"
              >
                ›
              </button>
            </>
          )}
        </div>

        {gallery.length > 1 && (
          <div className="flex gap-2 overflow-x-auto">
            {gallery.map((url, i) => (
              <button
                key={url + i}
                type="button"
                onClick={() => setActiveImage(i)}
                className={`relative h-16 w-16 shrink-0 overflow-hidden border transition-colors ${
                  i === activeImage ? "border-accent" : "border-white/20 hover:border-white/50"
                }`}
              >
                <Image src={url} alt={`${product.title} — foto ${i + 1}`} fill className="object-cover" sizes="64px" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <h1 className="font-display text-3xl tracking-wide sm:text-4xl">{product.title}</h1>

        <div className="mt-5 text-xl font-semibold">
          {variante?.calculated_price?.calculated_amount != null && variante.calculated_price.currency_code
            ? formatMoney(variante.calculated_price.calculated_amount, variante.calculated_price.currency_code)
            : "[preço indisponível]"}
        </div>

        {presale && (
          <div className="mt-5 border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-paper/85">
            <span className="font-bold text-accent">PRÉ-VENDA — </span>
            {presale.message}
            {presale.estimatedShipDate && (
              <> Prazo estimado de envio: {new Date(presale.estimatedShipDate).toLocaleDateString("pt-BR")}.</>
            )}
          </div>
        )}

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

        {disponivel && (
          <div className="mt-9 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
              className="h-11 w-11 border border-white/25 text-lg hover:border-white/50"
            >
              −
            </button>
            <span className="w-6 text-center text-sm font-semibold">{quantidade}</span>
            <button
              type="button"
              onClick={() => setQuantidade((q) => q + 1)}
              className="h-11 w-11 border border-white/25 text-lg hover:border-white/50"
            >
              +
            </button>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <button
            type="button"
            disabled={!disponivel || isPending}
            onClick={handleAddToCart}
            className="border border-accent bg-accent px-8 py-4 text-[13px] font-bold tracking-[0.12em] text-paper transition-colors hover:bg-paper hover:text-ink disabled:cursor-not-allowed disabled:border-white/20 disabled:bg-transparent disabled:text-paper/40 disabled:hover:bg-transparent disabled:hover:text-paper/40"
          >
            {!disponivel ? "INDISPONÍVEL" : isPending ? "ADICIONANDO..." : "ADICIONAR À SACOLA"}
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
        {feedback === "ok" && (
          <p className="mt-3 text-sm font-semibold text-accent">Adicionado à sacola.</p>
        )}
        {feedback === "erro" && (
          <p className="mt-3 text-sm font-semibold text-red-400">Não foi possível adicionar à sacola.</p>
        )}
      </div>
    </div>
  );
}
