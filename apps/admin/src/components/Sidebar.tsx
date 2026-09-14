"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/pedidos", label: "Pedidos" },
  { href: "/wab", label: "WAB" },
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
      <div className="mb-4 px-2 text-lg font-bold tracking-tight text-ink">PIQUE Admin</div>
      {NAV_ITEMS.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              active ? "bg-accent/10 text-accent" : "text-muted hover:bg-bg hover:text-ink"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
