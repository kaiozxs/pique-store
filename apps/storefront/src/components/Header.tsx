import Link from "next/link";
import Image from "next/image";

const NAV_LINKS = [
  { href: "/drops", label: "DROPS" },
  { href: "/wab", label: "WAB" },
  { href: "/dicas", label: "DICAS" },
  { href: "/pedido", label: "PEDIDO" },
  { href: "/ajuda", label: "AJUDA" },
];

export function Header() {
  return (
    <header className="bg-ink text-paper">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-5 sm:px-8">
        <Link href="/" className="flex items-center">
          <Image src="/logo.png" alt="PIQUE" width={44} height={44} className="rounded-sm" priority />
        </Link>

        <nav className="hidden items-center gap-9 text-[13px] font-semibold tracking-[0.14em] md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-accent">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-6 text-[13px] font-semibold tracking-[0.1em]">
          <Link href="/conta" className="hidden sm:inline transition-colors hover:text-accent">
            ENTRAR
          </Link>
          <Link
            href="/sacola"
            aria-label="Sacola, 0 itens"
            className="flex items-center gap-2 border border-white/25 px-3 py-2 transition-colors hover:border-accent hover:text-accent"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M6 8h12l-1 12H7L6 8Z M9 8V6a3 3 0 0 1 6 0v2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
            0
          </Link>
        </div>
      </div>
    </header>
  );
}
