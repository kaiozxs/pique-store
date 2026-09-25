import Link from "next/link";
import Image from "next/image";
import type { MedusaProduct, MedusaRegion } from "@/lib/medusa";
import { cheapestPrice, formatMoney, getPresaleInfo, isProductAvailable } from "@/lib/medusa";

const GARMENT_ICON_PATH =
  "M4 7.2 L8.2 4 L10 5.6 L14 5.6 L15.8 4 L20 7.2 L17.8 10.4 L16 9.3 L16 20 L8 20 L8 9.3 L6.2 10.4 Z";

export function ProductCard({ product }: { product: MedusaProduct; region: MedusaRegion }) {
  const available = isProductAvailable(product);
  const price = cheapestPrice(product);
  const image = product.thumbnail ?? product.images?.[0]?.url;
  const presale = getPresaleInfo(product);

  return (
    <Link href={`/produtos/${product.handle}`} className="group block">
      {/* Tracejado só no card sem foto, onde ele avisa que falta a imagem.
          Com foto de verdade, tracejado passa impressão de página inacabada. */}
      <div
        className={`relative flex aspect-square flex-col items-center justify-center gap-3.5 overflow-hidden bg-product ${
          image ? "border border-white/10" : "border border-dashed border-white/20"
        }`}
      >
        {presale && (
          <div className="absolute left-3.5 top-3.5 bg-accent px-2.5 py-1 text-[10px] font-bold tracking-[0.1em] text-paper">
            PRÉ-VENDA
          </div>
        )}
        {!available && (
          <div className="absolute right-3.5 top-3.5 bg-paper/10 px-2.5 py-1 text-[10px] font-bold tracking-[0.1em] text-paper/70">
            INDISPONÍVEL
          </div>
        )}
        {image ? (
          // object-contain, não cover: as fotos são mais largas que o card, e
          // preencher cortava justamente as mangas. Assim a peça aparece
          // inteira, e o respiro interno afasta ela das bordas em vez de
          // encostar no corte.
          <Image
            src={image}
            alt={product.title}
            fill
            className="object-contain"
            sizes="(min-width: 1024px) 25vw, 50vw"
          />
        ) : (
          <>
            <svg width="52" height="52" viewBox="0 0 24 24" aria-hidden="true" className="text-paper/35">
              <path d={GARMENT_ICON_PATH} fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" strokeLinecap="round" />
            </svg>
            <div className="text-[11px] tracking-[0.08em] text-paper/50">[FOTO DO PRODUTO]</div>
          </>
        )}
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-3">
        <div>
          <div className="text-[15px] font-bold transition-colors group-hover:text-accent">{product.title}</div>
        </div>
        <div className="whitespace-nowrap text-sm font-semibold">
          {price ? formatMoney(price.amount, price.currencyCode) : "[preço indisponível]"}
        </div>
      </div>
    </Link>
  );
}
