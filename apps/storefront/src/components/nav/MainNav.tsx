"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { NavCategory } from "@/lib/medusa";

const UTILITY_LINKS = [
  { href: "/book", label: "BOOK" },
  { href: "/dicas", label: "DICAS" },
  { href: "/ajuda", label: "AJUDA" },
];

const CLOSE_DELAY_MS = 150;

function CategoryLinks({ categories, onNavigate }: { categories: NavCategory[]; onNavigate?: () => void }) {
  return (
    <>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={category.available ? `/drops?categoria=${category.handle}` : "#"}
          aria-disabled={!category.available}
          onClick={(e) => {
            if (!category.available) e.preventDefault();
            else onNavigate?.();
          }}
          className={`group flex items-baseline justify-between gap-3 border-b border-white/10 py-3.5 font-display text-2xl tracking-wide transition-colors ${
            category.available ? "text-paper hover:text-accent" : "cursor-default text-paper/35"
          }`}
        >
          <span>{category.name}</span>
          {!category.available && (
            <span className="shrink-0 text-[10px] font-sans font-bold tracking-[0.14em] text-accent/70">
              EM BREVE
            </span>
          )}
        </Link>
      ))}
      <Link
        href="#"
        aria-disabled="true"
        onClick={(e) => e.preventDefault()}
        className="group flex items-baseline justify-between gap-3 border-b border-white/10 py-3.5 font-display text-2xl tracking-wide text-paper/35"
      >
        <span>Promoção</span>
        <span className="shrink-0 text-[10px] font-sans font-bold tracking-[0.14em] text-accent/70">EM BREVE</span>
      </Link>
    </>
  );
}

export function MainNav({ categories }: { categories: NavCategory[] }) {
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function cancelClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }

  function scheduleClose() {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
  }

  return (
    <>
      <nav className="hidden items-center gap-9 text-[13px] font-semibold tracking-[0.14em] md:flex">
        <div
          className="relative"
          onMouseEnter={() => {
            cancelClose();
            setOpen(true);
          }}
          onMouseLeave={scheduleClose}
        >
          <button
            type="button"
            className="flex items-center gap-1.5 transition-colors hover:text-accent"
            aria-haspopup="true"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            VESTUÁRIO
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              aria-hidden="true"
              className={`transition-transform ${open ? "rotate-180" : ""}`}
            >
              <path d="M4 8l8 8 8-8" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {open && (
            <div className="absolute left-1/2 top-full z-40 w-[560px] -translate-x-1/2 pt-4">
              <div className="border border-white/15 bg-ink shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
                <div className="grid grid-cols-2 gap-x-8 gap-y-1 p-7">
                  <CategoryLinks categories={categories} />
                </div>
                <Link
                  href="/drops"
                  className="block border-t border-white/15 px-7 py-4 text-center text-[12px] font-bold tracking-[0.18em] text-paper/70 transition-colors hover:bg-accent hover:text-paper"
                >
                  VER TODOS OS DROPS →
                </Link>
              </div>
            </div>
          )}
        </div>

        {UTILITY_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="transition-colors hover:text-accent">
            {link.label}
          </Link>
        ))}
      </nav>

      <button
        type="button"
        aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center text-paper transition-colors hover:text-accent md:hidden"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
          {mobileOpen ? (
            <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          )}
        </svg>
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 overflow-y-auto bg-ink px-6 py-8 md:hidden">
          <div className="mb-8 flex items-center justify-between">
            <span className="font-display text-2xl tracking-wide text-paper">PIQUE</span>
            <button
              type="button"
              aria-label="Fechar menu"
              onClick={() => setMobileOpen(false)}
              className="flex h-9 w-9 items-center justify-center text-paper transition-colors hover:text-accent"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <div className="mb-2 text-[11px] font-bold tracking-[0.18em] text-paper/50">VESTUÁRIO</div>
          <div className="mb-8 flex flex-col">
            <CategoryLinks categories={categories} onNavigate={() => setMobileOpen(false)} />
          </div>
          <div className="flex flex-col gap-1">
            {UTILITY_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="border-b border-white/10 py-3.5 font-display text-2xl tracking-wide text-paper transition-colors hover:text-accent"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
