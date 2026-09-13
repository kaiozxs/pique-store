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
          <Link href="/sacola" className="flex items-center gap-2 transition-colors hover:text-accent">
            SACOLA
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
            0
          </Link>
        </div>
      </div>
    </header>
  );
}
