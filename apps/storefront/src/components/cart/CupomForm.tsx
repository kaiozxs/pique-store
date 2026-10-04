"use client";

import { useState, useTransition } from "react";
import { applyPromoAction, removePromoAction } from "@/lib/cart-actions";

export function CupomForm({ aplicados }: { aplicados: string[] }) {
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();

  function aplicar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    iniciar(async () => {
      const r = await applyPromoAction(codigo);
      if (r.ok) setCodigo("");
      else setErro(r.error);
    });
  }

  return (
    <div className="w-full max-w-xs">
      <form onSubmit={aplicar} className="flex gap-2">
        <label htmlFor="cupom" className="sr-only">
          Cupom de desconto
        </label>
        <input
          id="cupom"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          placeholder="Cupom de desconto"
          autoCapitalize="characters"
          className="min-w-0 flex-1 border border-white/20 bg-transparent px-3 py-2 text-sm uppercase outline-none placeholder:normal-case placeholder:text-paper/40 focus:border-white/50"
        />
        <button
          type="submit"
          disabled={pendente}
          className="toque border border-white/30 px-4 text-[12px] font-bold tracking-[0.12em] hover:border-white disabled:opacity-50"
        >
          {pendente ? "..." : "APLICAR"}
        </button>
      </form>
      {erro && (
        <p role="alert" className="mt-2 text-[12px] text-red-400">
          {erro}
        </p>
      )}
      {aplicados.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {aplicados.map((c) => (
            <li key={c} className="flex items-center gap-2 border border-white/20 px-3 py-1 text-[12px] font-semibold tracking-[0.1em]">
              {c}
              <button
                type="button"
                aria-label={`Remover cupom ${c}`}
                onClick={() => iniciar(() => removePromoAction(c))}
                className="text-paper/60 hover:text-paper"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
