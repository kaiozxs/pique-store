"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import type { HttpTypes } from "@medusajs/types";
import { formatMoney } from "@/lib/medusa";
import type { MedusaCart } from "@/lib/cart";
import type { ShippingAddressInput, ShippingOption } from "@/lib/checkout";
import {
  completeCheckoutAction,
  getShippingOptionsAction,
  initiateMercadoPagoSessionAction,
  saveAddressAction,
  selectShippingOptionAction,
} from "@/lib/checkout-actions";
import { MercadoPagoPaymentBrick } from "@/components/checkout/MercadoPagoPaymentBrick";
import { AuthForms } from "@/app/conta/AuthForms";

type Step = "endereco" | "frete" | "login" | "pagamento" | "revisao" | "confirmado";

const EMPTY_ADDRESS: ShippingAddressInput = {
  first_name: "",
  last_name: "",
  address_1: "",
  address_2: "",
  city: "",
  province: "",
  postal_code: "",
  country_code: "",
  phone: "",
};

export function CheckoutClient({
  initialCart,
  countries,
  hasAccount,
  initialStep = "endereco",
}: {
  initialCart: MedusaCart | null;
  countries: { code: string; label: string }[];
  hasAccount: boolean;
  initialStep?: "endereco" | "pagamento";
}) {
  const [step, setStep] = useState<Step>(initialStep === "pagamento" && hasAccount ? "pagamento" : "endereco");
  // Some se a pessoa logar durante o checkout (Google ou e-mail/senha) sem
  // precisar recarregar a página inteira — hasAccount só reflete o cookie no
  // momento em que o servidor renderizou.
  const [loggedIn, setLoggedIn] = useState(hasAccount);
  const [cart, setCart] = useState(initialCart);
  const [email, setEmail] = useState(initialCart?.email ?? "");
  const [address, setAddress] = useState<ShippingAddressInput>({
    ...EMPTY_ADDRESS,
    country_code: countries[0]?.code ?? "",
  });
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [order, setOrder] = useState<HttpTypes.StoreOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cepLoading, setCepLoading] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  // Preenche endereço/cidade/estado automaticamente a partir do CEP (ViaCEP —
  // gratuito, sem chave, padrão em e-commerce brasileiro). Só dispara quando o
  // país selecionado é Brasil e o CEP tem os 8 dígitos.
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
      .catch(() => {
        // CEP não encontrado ou API fora do ar — cliente preenche na mão.
      })
      .finally(() => setCepLoading(false));
  }

  useEffect(() => {
    if (step !== "frete") return;
    startTransition(async () => {
      const options = await getShippingOptionsAction();
      setShippingOptions(options);
      setSelectedOptionId(options[0]?.id ?? null);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  useEffect(() => {
    if (step !== "pagamento") return;
    startTransition(async () => {
      const amount = await initiateMercadoPagoSessionAction();
      setPaymentAmount(amount);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  function handleAddressSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const updated = await saveAddressAction(email, address);
        setCart(updated);
        setStep("frete");
      } catch {
        setError("Não foi possível salvar o endereço. Confira os campos.");
      }
    });
  }

  function handleShippingSubmit() {
    if (!selectedOptionId) return;
    setError(null);
    startTransition(async () => {
      try {
        const updated = await selectShippingOptionAction(selectedOptionId);
        setCart(updated);
        // Antes de pagar, precisa ter conta — sem isso não tem como emitir
        // nota, avisar sobre o pedido nem o cliente acompanhar depois em
        // "meus pedidos".
        setStep(loggedIn ? "pagamento" : "login");
      } catch {
        setError("Não foi possível selecionar o frete.");
      }
    });
  }

  function handleComplete() {
    setError(null);
    startTransition(async () => {
      const result = await completeCheckoutAction();
      if (result.ok) {
        setOrder(result.order);
        setStep("confirmado");
      } else {
        setError(result.error);
      }
    });
  }

  if (step === "confirmado" && order) {
    return (
      <div className="bg-ink text-paper">
        <div className="mx-auto max-w-2xl px-6 py-24 text-center sm:px-8">
          <div className="mb-4 text-[13px] font-semibold tracking-[0.28em] text-accent">PEDIDO CONFIRMADO</div>
          <h1 className="font-display text-3xl tracking-wide sm:text-5xl">OBRIGADO, {(order.email ?? "").split("@")[0].toUpperCase()}</h1>
          <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-paper/60">
            Pedido #{order.display_id} confirmado. Total de {formatMoney(order.total, order.currency_code)}.
          </p>
          <Link
            href="/"
            className="mt-9 inline-block border border-accent bg-accent px-8 py-4 text-[13px] font-bold tracking-[0.14em] transition-colors hover:bg-paper hover:text-ink"
          >
            VOLTAR À LOJA
          </Link>
        </div>
      </div>
    );
  }

  if (!cart) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-ink px-6 text-center text-paper">
        <div className="mb-4 text-[13px] font-semibold tracking-[0.28em] text-paper/50">CHECKOUT</div>
        <h1 className="font-display text-3xl tracking-wide sm:text-5xl">SUA SACOLA ESTÁ VAZIA</h1>
        <Link
          href="/drops"
          className="mt-9 border border-accent bg-accent px-8 py-4 text-[13px] font-bold tracking-[0.14em] transition-colors hover:bg-paper hover:text-ink"
        >
          EXPLORAR OS DROPS
        </Link>
      </div>
    );
  }

  const currencyCode = cart.currency_code;

  return (
    <div className="bg-ink text-paper">
      <div className="mx-auto max-w-3xl px-6 py-16 sm:px-8">
        <div className="mb-2 text-[13px] font-semibold tracking-[0.28em] text-paper/50">CHECKOUT</div>
        <h1 className="mb-10 font-display text-3xl tracking-wide sm:text-5xl">FINALIZAR PEDIDO</h1>

        <div className="mb-8 flex gap-6 text-[12px] font-semibold tracking-[0.1em] text-paper/40">
          <span className={step === "endereco" ? "text-accent" : ""}>1. ENDEREÇO</span>
          <span className={step === "frete" ? "text-accent" : ""}>2. FRETE</span>
          <span className={step === "login" || step === "pagamento" ? "text-accent" : ""}>3. PAGAMENTO</span>
          <span className={step === "revisao" ? "text-accent" : ""}>4. REVISÃO</span>
        </div>

        {error && <p className="mb-6 text-sm font-semibold text-red-400">{error}</p>}

        {step === "endereco" && (
          <form onSubmit={handleAddressSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              required
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-white/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-accent"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                required
                placeholder="Nome"
                value={address.first_name}
                onChange={(e) => setAddress({ ...address, first_name: e.target.value })}
                className="border border-white/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-accent"
              />
              <input
                required
                placeholder="Sobrenome"
                value={address.last_name}
                onChange={(e) => setAddress({ ...address, last_name: e.target.value })}
                className="border border-white/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-accent"
              />
            </div>
            <input
              required
              placeholder="Endereço"
              value={address.address_1}
              onChange={(e) => setAddress({ ...address, address_1: e.target.value })}
              className="border border-white/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-accent"
            />
            <input
              placeholder="Complemento (opcional)"
              value={address.address_2}
              onChange={(e) => setAddress({ ...address, address_2: e.target.value })}
              className="border border-white/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-accent"
            />
            <div className="grid grid-cols-3 gap-4">
              <input
                required
                placeholder="Cidade"
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                className="border border-white/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-accent"
              />
              <input
                placeholder="Estado/Província"
                value={address.province}
                onChange={(e) => setAddress({ ...address, province: e.target.value })}
                className="border border-white/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-accent"
              />
              <input
                required
                placeholder={cepLoading ? "Buscando..." : "CEP"}
                value={address.postal_code}
                onChange={(e) => handlePostalCodeChange(e.target.value)}
                className="border border-white/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-accent"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <select
                required
                value={address.country_code}
                onChange={(e) => setAddress({ ...address, country_code: e.target.value })}
                className="border border-white/20 bg-ink px-4 py-3 text-sm outline-none focus:border-accent"
              >
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
              <input
                placeholder="Telefone (opcional)"
                value={address.phone}
                onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                className="border border-white/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-accent"
              />
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="mt-4 w-fit border border-accent bg-accent px-8 py-4 text-[13px] font-bold tracking-[0.14em] transition-colors hover:bg-paper hover:text-ink disabled:opacity-60"
            >
              {isPending ? "SALVANDO..." : "CONTINUAR PARA FRETE"}
            </button>
          </form>
        )}

        {step === "frete" && (
          <div className="flex flex-col gap-4">
            {shippingOptions.length === 0 && !isPending && (
              <p className="text-sm text-paper/60">Nenhuma opção de frete disponível pra esse endereço.</p>
            )}
            {shippingOptions.map((option) => (
              <label
                key={option.id}
                className={`flex cursor-pointer items-center justify-between border px-4 py-3 text-sm transition-colors ${
                  selectedOptionId === option.id ? "border-accent" : "border-white/20"
                }`}
              >
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shipping-option"
                    checked={selectedOptionId === option.id}
                    onChange={() => setSelectedOptionId(option.id)}
                  />
                  {option.name}
                </span>
                <span>{formatMoney(option.amount ?? 0, currencyCode)}</span>
              </label>
            ))}
            <button
              type="button"
              disabled={isPending || !selectedOptionId}
              onClick={handleShippingSubmit}
              className="mt-4 w-fit border border-accent bg-accent px-8 py-4 text-[13px] font-bold tracking-[0.14em] transition-colors hover:bg-paper hover:text-ink disabled:opacity-60"
            >
              {isPending ? "SALVANDO..." : "CONTINUAR PARA REVISÃO"}
            </button>
          </div>
        )}

        {step === "login" && (
          <div className="flex flex-col gap-6">
            <p className="text-sm text-paper/70">
              Entre ou crie sua conta pra continuar pro pagamento — é o que garante que você consiga
              acompanhar esse pedido depois em &ldquo;meus pedidos&rdquo;.
            </p>
            <AuthForms
              onSuccess={() => {
                setLoggedIn(true);
                setStep("pagamento");
              }}
              postLoginRedirect="/checkout?step=pagamento"
            />
          </div>
        )}

        {step === "pagamento" && (
          <div className="flex flex-col gap-4">
            {paymentAmount === null ? (
              <p className="text-sm text-paper/60">Carregando pagamento...</p>
            ) : (
              <MercadoPagoPaymentBrick
                amount={paymentAmount}
                email={email}
                onSuccess={() => setStep("revisao")}
              />
            )}
          </div>
        )}

        {step === "revisao" && (
          <div className="flex flex-col gap-6">
            <div>
              {(cart.items ?? []).map((item) => (
                <div key={item.id} className="flex justify-between border-b border-white/10 py-3 text-sm">
                  <span>
                    {item.product_title ?? item.title} {item.variant_title ? `— ${item.variant_title}` : ""} ×{" "}
                    {item.quantity}
                  </span>
                  <span>{formatMoney(item.total ?? item.unit_price * item.quantity, currencyCode)}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-1 text-sm text-paper/70">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatMoney(cart.item_subtotal ?? cart.subtotal, currencyCode)}</span>
              </div>
              <div className="flex justify-between">
                <span>Frete</span>
                <span>{formatMoney(cart.shipping_total ?? 0, currencyCode)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-paper">
                <span>Total</span>
                <span>{formatMoney(cart.total, currencyCode)}</span>
              </div>
            </div>
            <button
              type="button"
              disabled={isPending}
              onClick={handleComplete}
              className="w-fit border border-accent bg-accent px-8 py-4 text-[13px] font-bold tracking-[0.14em] transition-colors hover:bg-paper hover:text-ink disabled:opacity-60"
            >
              {isPending ? "PROCESSANDO..." : "FINALIZAR PEDIDO"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
