"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { formatMoney } from "@/lib/medusa";
import { logoutAction } from "@/app/conta/actions";

const CLOSE_DELAY_MS = 150;

export type MiniCartItem = {
  id: string;
  title: string;
  variantTitle: string | null;
  thumbnail: string | null;
  quantity: number;
  total: number;
};

export type MiniCart = {
  items: MiniCartItem[];
  itemCount: number;
  subtotal: number;
  total: number;
  currencyCode: string;
};

function useHoverOpen() {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function cancelClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }

  function scheduleClose() {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
  }

  return {
    open,
    onMouseEnter: () => {
      cancelClose();
      setOpen(true);
    },
    onMouseLeave: scheduleClose,
    close: () => setOpen(false),
  };
}

function SearchAction() {
  const router = useRouter();
  const { open, onMouseEnter, onMouseLeave, close } = useHoverOpen();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  return (
    <div className="relative flex items-center" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <form
        action="/drops"
        className={`flex items-center overflow-hidden border transition-[width,opacity,border-color] duration-200 ${
          open ? "w-44 border-white/25 bg-ink px-3 py-1.5 opacity-100 sm:w-56" : "w-0 border-transparent opacity-0"
        }`}
        onSubmit={close}
      >
        <input
          ref={inputRef}
          name="q"
          type="search"
          placeholder="Buscar peças..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-paper/40"
          tabIndex={open ? 0 : -1}
        />
      </form>
      <Link
        href="/drops"
        aria-label="Buscar produtos"
        className="shrink-0 pl-3 transition-colors hover:text-accent"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M10 4a6 6 0 1 0 0 12 6 6 0 0 0 0-12ZM20 20l-4.35-4.35"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      </Link>
    </div>
  );
}

function AccountAction({ customer }: { customer: { firstName: string | null } | null }) {
  const { open, onMouseEnter, onMouseLeave } = useHoverOpen();

  const icon = (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="3.4" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M4.5 20c1.4-3.6 4.4-5.6 7.5-5.6s6.1 2 7.5 5.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );

  if (!customer) {
    return (
      <Link href="/conta" aria-label="Entrar" className="transition-colors hover:text-accent">
        {icon}
      </Link>
    );
  }

  return (
    <div className="relative" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <Link
        href="/conta"
        aria-label={`Minha conta${customer.firstName ? `, ${customer.firstName}` : ""}`}
        aria-haspopup="true"
        aria-expanded={open}
        className="block transition-colors hover:text-accent"
      >
        {icon}
      </Link>

      {open && (
        <div className="absolute right-0 top-full z-40 w-52 pt-4">
          <div className="border border-white/15 bg-ink shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
            {customer.firstName && (
              <div className="border-b border-white/10 px-5 py-4 text-sm text-paper/70">
                Olá, <span className="font-semibold text-paper">{customer.firstName}</span>
              </div>
            )}
            <Link
              href="/conta"
              className="block px-5 py-3 text-[13px] font-semibold tracking-[0.06em] text-paper transition-colors hover:bg-white/5 hover:text-accent"
            >
              MINHA CONTA
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="block w-full px-5 py-3 text-left text-[13px] font-semibold tracking-[0.06em] text-paper/70 transition-colors hover:bg-white/5 hover:text-accent"
              >
                SAIR
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function CartAction({ cart }: { cart: MiniCart }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        aria-label={`Sacola, ${cart.itemCount} ${cart.itemCount === 1 ? "item" : "itens"}`}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative block transition-colors hover:text-accent"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M6 8h12l-1 12H7L6 8Z M9 8V6a3 3 0 0 1 6 0v2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold leading-none text-paper">
          {cart.itemCount}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-40 w-80 pt-4">
          <div className="border border-white/15 bg-ink shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
            {cart.items.length === 0 ? (
              <div className="flex flex-col items-center gap-4 px-5 py-8 text-center">
                <p className="text-sm text-paper/60">Sua sacola está vazia.</p>
                <Link
                  href="/drops"
                  onClick={() => setOpen(false)}
                  className="border border-accent bg-accent px-5 py-2.5 text-[12px] font-bold tracking-[0.1em] transition-colors hover:bg-paper hover:text-ink"
                >
                  EXPLORAR OS DROPS
                </Link>
              </div>
            ) : (
              <>
                <div className="max-h-80 overflow-y-auto">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex gap-3 border-b border-white/10 px-5 py-4 last:border-b-0">
                      <div className="relative h-16 w-14 shrink-0 overflow-hidden border border-dashed border-white/20 bg-[#161617]">
                        {item.thumbnail && (
                          <Image src={item.thumbnail} alt={item.title} fill className="object-cover" sizes="56px" />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col justify-center gap-1">
                        <div className="text-[13px] font-semibold text-paper">{item.title}</div>
                        {item.variantTitle && <div className="text-xs text-paper/50">{item.variantTitle}</div>}
                        <div className="text-xs text-paper/60">
                          {item.quantity} × {formatMoney(item.total / item.quantity, cart.currencyCode)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-3 border-t border-white/15 px-5 py-4">
                  <div className="flex justify-between text-sm font-bold text-paper">
                    <span>Total</span>
                    <span>{formatMoney(cart.total, cart.currencyCode)}</span>
                  </div>
                  <Link
                    href="/checkout"
                    onClick={() => setOpen(false)}
                    className="border border-accent bg-accent px-5 py-3 text-center text-[13px] font-bold tracking-[0.1em] transition-colors hover:bg-paper hover:text-ink"
                  >
                    IR PARA PAGAMENTO
                  </Link>
                  <Link
                    href="/sacola"
                    onClick={() => setOpen(false)}
                    className="text-center text-[12px] font-semibold tracking-[0.08em] text-paper/60 transition-colors hover:text-accent"
                  >
                    VER SACOLA
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function HeaderActions({
  customer,
  cart,
}: {
  customer: { firstName: string | null } | null;
  cart: MiniCart;
}) {
  return (
    <div className="flex items-center gap-5">
      <SearchAction />
      <AccountAction customer={customer} />
      <CartAction cart={cart} />
    </div>
  );
}
