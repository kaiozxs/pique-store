import type { Metadata } from "next";
import { getCurrentCustomer, listCustomerOrders } from "@/lib/customer";
import { AuthForms } from "./AuthForms";
import { AccountDashboard } from "./AccountDashboard";

export const metadata: Metadata = { title: "Conta — PIQUE" };

export default async function ContaPage() {
  const customer = await getCurrentCustomer();

  if (!customer) {
    return (
      <div className="bg-ink text-paper">
        <div className="mx-auto max-w-3xl px-6 py-24 sm:px-8">
          <div className="mb-2 text-center text-[13px] font-semibold tracking-[0.28em] text-paper/50">CONTA</div>
          <h1 className="mb-12 text-center font-display text-3xl tracking-wide sm:text-5xl">ENTRAR</h1>
          <AuthForms />
        </div>
      </div>
    );
  }

  const orders = await listCustomerOrders();
  return <AccountDashboard customer={customer} orders={orders} />;
}
