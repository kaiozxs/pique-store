"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/medusa";
import { getShippingOptionsAction } from "@/lib/checkout-actions";

type Address = { city: string; uf: string };
type Option = { id: string; name: string; amount: number };

export function ShippingEstimate({ currencyCode }: { currencyCode: string }) {
  const [cep, setCep] = useState("");
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState<Address | null>(null);
  const [options, setOptions] = useState<Option[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleCepChange(value: string) {
    setCep(value);
    setAddress(null);
    setOptions(null);
    setError(null);
  }

  async function handleCalculate() {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) {
      setError("Digite um CEP válido.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (data.erro) {
        setError("CEP não encontrado.");
        return;
      }
      setAddress({ city: data.localidade, uf: data.uf });

      // Os fretes hoje são fixos (não variam por CEP) — a consulta serve
      // pra confirmar que o endereço existe e mostrar pra onde a peça vai.
      // O preço em si vem do carrinho real, se já tiver um; sem carrinho
      // ainda (ninguém adicionou nada), mostra só o aviso genérico.
      try {
        const shippingOptions = await getShippingOptionsAction();
        setOptions(shippingOptions.map((o) => ({ id: o.id, name: o.name ?? "", amount: o.amount ?? 0 })));
      } catch {
        setOptions(null);
      }
    } catch {
      setError("Não foi possível consultar o CEP agora.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-8 border border-white/15 p-4">
      <div className="mb-3 text-xs font-bold tracking-[0.1em] text-paper/60">CALCULAR FRETE E PRAZO</div>
      <div className="flex gap-2">
        <input
          value={cep}
          onChange={(e) => handleCepChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCalculate()}
          placeholder="00000-000"
          maxLength={9}
          className="w-32 border border-white/25 bg-transparent px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <button
          type="button"
          onClick={handleCalculate}
          disabled={loading}
          className="border border-white/25 px-4 py-2 text-xs font-bold tracking-[0.08em] transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
        >
          {loading ? "CALCULANDO..." : "CALCULAR"}
        </button>
      </div>

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

      {address && (
        <div className="mt-3 text-sm text-paper/70">
          Entregamos em{" "}
          <span className="font-semibold text-paper">
            {address.city}/{address.uf}
          </span>
          .
          {options && options.length > 0 ? (
            <ul className="mt-2 flex flex-col gap-1">
              {options.map((o) => (
                <li key={o.id} className="flex justify-between gap-4 text-xs text-paper/60">
                  <span>{o.name}</span>
                  <span>{formatMoney(o.amount, currencyCode)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-xs text-paper/50">O valor exato do frete é calculado no carrinho.</p>
          )}
        </div>
      )}
    </div>
  );
}
