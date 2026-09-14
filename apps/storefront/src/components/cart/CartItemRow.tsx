"use client";

import Image from "next/image";
import { useTransition } from "react";
import { formatMoney } from "@/lib/medusa";
import { removeCartItemAction, updateCartItemAction } from "@/lib/cart-actions";

export function CartItemRow({
  id,
  title,
  variantTitle,
  thumbnail,
  quantity,
  unitPrice,
  total,
  currencyCode,
}: {
  id: string;
  title: string;
  variantTitle: string | null;
  thumbnail: string | null;
  quantity: number;
  unitPrice: number;
  total: number;
  currencyCode: string;
}) {
  const [isPending, startTransition] = useTransition();

  function updateQuantity(next: number) {
    startTransition(() => updateCartItemAction(id, next));
  }

  function remove() {
    startTransition(() => removeCartItemAction(id));
  }

  return (
    <div className={`flex gap-4 border-b border-white/10 py-6 ${isPending ? "opacity-50" : ""}`}>
      <div className="relative h-24 w-20 shrink-0 overflow-hidden border border-dashed border-white/20 bg-[#161617]">
        {thumbnail && <Image src={thumbnail} alt={title} fill className="object-cover" sizes="80px" />}
      </div>
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <div className="text-sm font-bold text-paper">{title}</div>
          {variantTitle && <div className="mt-1 text-xs text-paper/55">{variantTitle}</div>}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={isPending}
            onClick={() => updateQuantity(quantity - 1)}
            className="h-8 w-8 border border-white/25 text-sm hover:border-white/50"
          >
            −
          </button>
          <span className="w-5 text-center text-sm">{quantity}</span>
          <button
            type="button"
            disabled={isPending}
            onClick={() => updateQuantity(quantity + 1)}
            className="h-8 w-8 border border-white/25 text-sm hover:border-white/50"
          >
            +
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={remove}
            className="ml-3 text-xs font-semibold tracking-[0.08em] text-paper/50 hover:text-accent"
          >
            REMOVER
          </button>
        </div>
      </div>
      <div className="flex flex-col items-end justify-between text-right">
        <div className="text-sm font-semibold text-paper">{formatMoney(total, currencyCode)}</div>
        <div className="text-xs text-paper/50">{formatMoney(unitPrice, currencyCode)} / un.</div>
      </div>
    </div>
  );
}
