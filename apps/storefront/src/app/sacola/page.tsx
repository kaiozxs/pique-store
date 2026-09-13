import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Sacola — PIQUE" };

export default function SacolaPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-ink px-6 text-center text-paper">
      <div className="mb-4 text-[13px] font-semibold tracking-[0.28em] text-paper/50">SACOLA</div>
      <h1 className="font-display text-3xl tracking-tight sm:text-5xl">SUA SACOLA ESTÁ VAZIA</h1>
      <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-paper/60">
        Carrinho e checkout chegam junto com a integração do backend.
      </p>
      <Link
        href="/drops"
        className="mt-9 border border-accent bg-accent px-8 py-4 text-[13px] font-bold tracking-[0.14em] transition-colors hover:bg-paper hover:text-ink"
      >
        EXPLORAR OS DROPS
      </Link>
    </div>
  );
}
