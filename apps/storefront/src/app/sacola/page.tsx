import type { Metadata } from "next";
import Link from "next/link";
import { getCart } from "@/lib/cart";
import { formatMoney } from "@/lib/medusa";
import { CupomForm } from "@/components/cart/CupomForm";
import { CartItemRow } from "@/components/cart/CartItemRow";

export const metadata: Metadata = { title: "Sacola — PIQUE" };

export default async function SacolaPage() {
  const cart = await getCart();
  const items = cart?.items ?? [];

  if (items.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-ink px-6 text-center text-paper">
        <div className="mb-4 text-[13px] font-semibold tracking-[0.28em] text-paper/50">SACOLA</div>
        <h1 className="font-display text-3xl tracking-wide sm:text-5xl">SUA SACOLA ESTÁ VAZIA</h1>
        <Link
          href="/drops"
          className="btn-preenche mt-9 border border-accent px-8 py-4 text-[13px] font-bold tracking-[0.14em]"
        >
          EXPLORAR OS DROPS
        </Link>
      </div>
    );
  }

  const currencyCode = cart!.currency_code;

  return (
    <div className="bg-ink text-paper">
      <div className="mx-auto max-w-4xl px-6 py-16 sm:px-8">
        <div className="mb-2 text-[13px] font-semibold tracking-[0.28em] text-paper/50">SACOLA</div>
        <h1 className="mb-10 font-display text-3xl tracking-wide sm:text-5xl">SUA SACOLA</h1>

        <div>
          {items.map((item) => (
            <CartItemRow
              key={item.id}
              id={item.id}
              title={item.product_title ?? item.title}
              variantTitle={item.variant_title ?? null}
              thumbnail={item.thumbnail ?? null}
              quantity={item.quantity}
              unitPrice={item.unit_price}
              total={item.total ?? item.unit_price * item.quantity}
              currencyCode={currencyCode}
            />
          ))}
        </div>

        <div className="mt-8 flex flex-col items-end gap-2">
          <CupomForm aplicados={(cart!.promotions ?? []).map((p) => p.code).filter((c): c is string => Boolean(c))} />
          {(cart!.discount_total ?? 0) > 0 && (
            <div className="flex w-full max-w-xs justify-between text-sm text-paper/70">
              <span>Desconto</span>
              <span>− {formatMoney(cart!.discount_total, currencyCode)}</span>
            </div>
          )}
          <div className="flex w-full max-w-xs justify-between text-sm text-paper/70">
            <span>Subtotal</span>
            <span>{formatMoney(cart!.item_subtotal ?? cart!.subtotal, currencyCode)}</span>
          </div>
          <div className="flex w-full max-w-xs justify-between text-base font-bold text-paper">
            <span>Total</span>
            <span>{formatMoney(cart!.total, currencyCode)}</span>
          </div>
          <Link
            href="/checkout"
            className="btn-preenche mt-4 border border-accent px-8 py-4 text-[13px] font-bold tracking-[0.14em]"
          >
            FINALIZAR COMPRA
          </Link>
        </div>
      </div>
    </div>
  );
}
