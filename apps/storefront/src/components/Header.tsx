import Link from "next/link";
import Image from "next/image";
import { getCartItemCount } from "@/lib/cart";
import { getCurrentCustomer } from "@/lib/customer";
import { listNavCategories } from "@/lib/medusa";
import { MainNav } from "@/components/nav/MainNav";

export async function Header() {
  const [itemCount, customer, categories] = await Promise.all([
    getCartItemCount(),
    getCurrentCustomer(),
    listNavCategories(),
  ]);

  return (
    <header className="bg-ink text-paper">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-5 sm:px-8">
        <Link href="/" className="flex items-center">
          <Image src="/logo.png" alt="PIQUE" width={76} height={57} style={{ height: "auto" }} priority />
        </Link>

        <MainNav categories={categories} />

        <div className="flex items-center gap-5">
          <Link href="/drops" aria-label="Buscar produtos" className="transition-colors hover:text-accent">
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
          <Link
            href="/conta"
            aria-label={customer ? `Minha conta, ${customer.first_name ?? ""}` : "Entrar"}
            className="transition-colors hover:text-accent"
          >
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
          </Link>
          <Link
            href="/sacola"
            aria-label={`Sacola, ${itemCount} ${itemCount === 1 ? "item" : "itens"}`}
            className="relative transition-colors hover:text-accent"
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
              {itemCount}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
