"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { formatMoney } from "@/lib/medusa";
import type { MedusaCustomer, MedusaCustomerOrder } from "@/lib/customer";
import type { ShippingAddressInput } from "@/lib/checkout";
import { addAddressAction, logoutAction, removeAddressAction } from "./actions";

const EMPTY_ADDRESS: ShippingAddressInput = {
  first_name: "",
  last_name: "",
  address_1: "",
  address_2: "",
  city: "",
  province: "",
  postal_code: "",
  country_code: "br",
  phone: "",
};

const inputClass = "border border-white/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-accent";

export function AccountDashboard({
  customer,
  orders,
}: {
  customer: MedusaCustomer;
  orders: MedusaCustomerOrder[];
}) {
  const router = useRouter();
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [address, setAddress] = useState<ShippingAddressInput>(EMPTY_ADDRESS);
  const [cepLoading, setCepLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Mesmo autofill de CEP do checkout (ViaCEP) — aqui pra manter os dois
  // formulários de endereço consistentes.
  function handlePostalCodeChange(value: string) {
    setAddress((prev) => ({ ...prev, postal_code: value }));
    const digits = value.replace(/\D/g, "");
    if (address.country_code !== "br" || digits.length !== 8) return;

    setCepLoading(true);
    fetch(`https://viacep.com.br/ws/${digits}/json/`)
      .then((res) => res.json())
      .then((data) => {
        if (data.erro) return;
        setAddress((prev) => ({
          ...prev,
          address_1: data.logradouro || prev.address_1,
          city: data.localidade || prev.city,
          province: data.uf ? data.uf.toLowerCase() : prev.province,
        }));
      })
      .catch(() => {})
      .finally(() => setCepLoading(false));
  }

  function handleAddAddress(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await addAddressAction(address);
      setAddress(EMPTY_ADDRESS);
      setShowAddressForm(false);
      router.refresh();
    });
  }

  function handleRemoveAddress(id: string) {
    startTransition(async () => {
      await removeAddressAction(id);
      router.refresh();
    });
  }

  return (
    <div className="bg-ink text-paper">
      <div className="mx-auto max-w-3xl px-6 py-16 sm:px-8">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <div className="mb-2 text-[13px] font-semibold tracking-[0.28em] text-paper/50">CONTA</div>
            <h1 className="font-display text-3xl tracking-wide sm:text-5xl">
              OLÁ, {(customer.first_name ?? customer.email).toUpperCase()}
            </h1>
          </div>
          <form action={logoutAction}>
            <button type="submit" className="text-sm font-semibold tracking-[0.08em] text-paper/50 hover:text-accent">
              SAIR
            </button>
          </form>
        </div>

        <section className="mb-12">
          <h2 className="mb-4 text-sm font-bold tracking-[0.1em] text-paper/70">DADOS</h2>
          <div className="text-sm text-paper/80">
            {customer.first_name} {customer.last_name}
            <br />
            {customer.email}
          </div>
        </section>

        <section className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-[0.1em] text-paper/70">ENDEREÇOS</h2>
            <button
              type="button"
              onClick={() => setShowAddressForm((v) => !v)}
              className="text-sm font-semibold text-accent"
            >
              {showAddressForm ? "cancelar" : "+ adicionar"}
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {(customer.addresses ?? []).map((addr) => (
              <div key={addr.id} className="flex items-center justify-between border border-white/10 px-4 py-3 text-sm">
                <div>
                  {addr.first_name} {addr.last_name} — {addr.address_1}, {addr.city} {addr.postal_code},{" "}
                  {addr.country_code?.toUpperCase()}
                </div>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleRemoveAddress(addr.id)}
                  className="text-xs font-semibold text-paper/50 hover:text-accent"
                >
                  REMOVER
                </button>
              </div>
            ))}
            {(customer.addresses ?? []).length === 0 && !showAddressForm && (
              <p className="text-sm text-paper/50">Nenhum endereço salvo ainda.</p>
            )}
          </div>

          {showAddressForm && (
            <form onSubmit={handleAddAddress} className="mt-4 flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  required
                  placeholder="Nome"
                  value={address.first_name}
                  onChange={(e) => setAddress({ ...address, first_name: e.target.value })}
                  className={inputClass}
                />
                <input
                  required
                  placeholder="Sobrenome"
                  value={address.last_name}
                  onChange={(e) => setAddress({ ...address, last_name: e.target.value })}
                  className={inputClass}
                />
              </div>
              <input
                required
                placeholder="Endereço"
                value={address.address_1}
                onChange={(e) => setAddress({ ...address, address_1: e.target.value })}
                className={inputClass}
              />
              <div className="grid grid-cols-3 gap-3">
                <input
                  required
                  placeholder="Cidade"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  className={inputClass}
                />
                <input
                  required
                  placeholder={cepLoading ? "Buscando..." : "CEP"}
                  value={address.postal_code}
                  onChange={(e) => handlePostalCodeChange(e.target.value)}
                  className={inputClass}
                />
                <input
                  required
                  placeholder="País (ex: br)"
                  value={address.country_code}
                  onChange={(e) => setAddress({ ...address, country_code: e.target.value })}
                  className={inputClass}
                />
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="w-fit border border-accent bg-accent px-6 py-2 text-[12px] font-bold tracking-[0.1em] text-paper hover:bg-paper hover:text-ink disabled:opacity-60"
              >
                {isPending ? "SALVANDO..." : "SALVAR ENDEREÇO"}
              </button>
            </form>
          )}
        </section>

        <section className="mb-12">
          <h2 className="mb-4 text-sm font-bold tracking-[0.1em] text-paper/70">AUTENTICIDADE</h2>
          <Link href="/verifique" className="text-sm font-semibold text-accent hover:underline">
            Verifique seu PIQUE →
          </Link>
        </section>

        <section>
          <h2 className="mb-4 text-sm font-bold tracking-[0.1em] text-paper/70">PEDIDOS</h2>
          {orders.length === 0 && <p className="text-sm text-paper/50">Nenhum pedido ainda.</p>}
          <div className="flex flex-col divide-y divide-white/10 border-y border-white/10">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-3 text-sm">
                <span>
                  #{order.display_id} — {new Date(order.created_at).toLocaleDateString("pt-BR")}
                </span>
                <span className="text-paper/60">{order.fulfillment_status}</span>
                <span className="font-semibold">{formatMoney(order.total, order.currency_code)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
