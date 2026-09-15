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
          <Image src="/logo.png" alt="PIQUE" width={44} height={44} className="rounded-sm" priority />
        </Link>

        <MainNav categories={categories} />

        <div className="flex items-center gap-6 text-[13px] font-semibold tracking-[0.1em]">
          <Link href="/conta" className="hidden sm:inline transition-colors hover:text-accent">
            {customer ? (customer.first_name ?? "CONTA").toUpperCase() : "ENTRAR"}
          </Link>
          <Link
            href="/sacola"
            aria-label={`Sacola, ${itemCount} ${itemCount === 1 ? "item" : "itens"}`}
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
            {itemCount}
          </Link>
        </div>
      </div>
    </header>
  );
}
