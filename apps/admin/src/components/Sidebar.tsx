"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/pedidos", label: "Pedidos" },
  { href: "/book", label: "Book" },
  { href: "/drop-semana", label: "Drop da Semana" },
  { href: "/home-config", label: "Home Configurável" },
  { href: "/dicas", label: "Dicas" },
  { href: "/faq", label: "FAQ" },
  { href: "/pecas", label: "Verifique seu PIQUE" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex h-full w-60 shrink-0 flex-col gap-1 border-r border-border bg-surface p-4">
      <div className="mb-6 flex items-center gap-2.5 px-2">
        <Image src="/logo.png" alt="PIQUE" width={56} height={42} style={{ height: "auto" }} priority />
        <div className="text-[10px] font-semibold tracking-[0.2em] text-muted">ADMIN</div>
      </div>
      {NAV_ITEMS.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`border-l-2 px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "border-accent bg-accent/10 text-ink"
                : "border-transparent text-muted hover:border-white/15 hover:bg-surface-raised hover:text-ink"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
