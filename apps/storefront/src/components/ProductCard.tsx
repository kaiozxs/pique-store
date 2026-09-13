import Link from "next/link";
import type { Produto } from "@/lib/sample-data";
import { formatPreco } from "@/lib/sample-data";

const GARMENT_ICON_PATH =
  "M4 7.2 L8.2 4 L10 5.6 L14 5.6 L15.8 4 L20 7.2 L17.8 10.4 L16 9.3 L16 20 L8 20 L8 9.3 L6.2 10.4 Z";

export function ProductCard({ produto }: { produto: Produto }) {
  const indisponivel = produto.variantes.every((v) => v.disponibilidade === "INDISPONIVEL");

  return (
    <Link href={`/produtos/${produto.slug}`} className="group block">
      <div className="relative flex aspect-[3/4] flex-col items-center justify-center gap-3.5 border border-dashed border-white/20 bg-[#161617]">
        {produto.badge && (
          <div className="absolute left-3.5 top-3.5 bg-accent px-2.5 py-1 text-[10px] font-bold tracking-[0.1em] text-paper">
            {produto.badge}
          </div>
        )}
        {indisponivel && (
          <div className="absolute right-3.5 top-3.5 bg-paper/10 px-2.5 py-1 text-[10px] font-bold tracking-[0.1em] text-paper/70">
            INDISPONÍVEL
          </div>
        )}
        <svg width="52" height="52" viewBox="0 0 24 24" aria-hidden="true" className="text-paper/35">
          <path d={GARMENT_ICON_PATH} fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
        <div className="text-[11px] tracking-[0.08em] text-paper/50">[FOTO DO PRODUTO]</div>
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-3">
        <div>
          <div className="text-[15px] font-bold transition-colors group-hover:text-accent">{produto.nome}</div>
          <div className="mt-1 text-xs text-paper/45">{produto.categoria}</div>
        </div>
        <div className="whitespace-nowrap text-sm font-semibold">
          {produto.precoPromocionalCentavos ? (
            <span className="text-accent">{formatPreco(produto.precoPromocionalCentavos)}</span>
          ) : (
            formatPreco(produto.precoCentavos)
          )}
        </div>
      </div>
    </Link>
  );
}
