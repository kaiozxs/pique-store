import Link from "next/link";
import Image from "next/image";
import { getCart } from "@/lib/cart";
import { getCurrentCustomer } from "@/lib/customer";
import { listNavCategories } from "@/lib/medusa";
import { MainNav } from "@/components/nav/MainNav";
import { HeaderActions, type MiniCart } from "@/components/nav/HeaderActions";

export async function Header() {
  const [cart, customer, categories] = await Promise.all([
    getCart(),
    getCurrentCustomer(),
    listNavCategories(),
  ]);

  const items = cart?.items ?? [];
  const miniCart: MiniCart = {
    items: items.map((item) => ({
      id: item.id,
      title: item.product_title ?? item.title,
      variantTitle: item.variant_title ?? null,
      thumbnail: item.thumbnail ?? null,
      quantity: item.quantity,
      total: item.total ?? item.unit_price * item.quantity,
    })),
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: cart?.item_subtotal ?? cart?.subtotal ?? 0,
    total: cart?.total ?? 0,
    currencyCode: cart?.currency_code ?? "brl",
  };

  return (
    <header className="bg-ink text-paper">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-7 py-5 sm:px-8">
        <Link href="/" className="ml-3 flex items-center">
          <Image src="/logo.png" alt="PIQUE" width={46} height={35} style={{ height: "auto" }} priority />
        </Link>

        <MainNav categories={categories} />

        <HeaderActions customer={customer ? { firstName: customer.first_name ?? null } : null} cart={miniCart} />
      </div>
    </header>
  );
}
