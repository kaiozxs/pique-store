"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveTrackingCodeAction } from "../actions";

/**
 * Código de rastreio digitado à mão.
 *
 * Enquanto a integração com os Correios não existe, é assim que o cliente
 * consegue acompanhar a entrega: alguém do time cola aqui o código do
 * despacho e ele aparece na conta do comprador, com link pro site dos
 * Correios. Aceita mais de um código separado por vírgula, pro pedido que vai
 * em duas caixas.
 */
export function RastreioForm({ orderId, inicial }: { orderId: string; inicial: string }) {
  const router = useRouter();
  const [codigo, setCodigo] = useState(inicial);
  const [salvo, setSalvo] = useState(false);
  const [isPending, startTransition] = useTransition();

  function salvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvo(false);
    startTransition(async () => {
      await saveTrackingCodeAction(orderId, codigo);
      setSalvo(true);
      router.refresh();
    });
  }

  return (
    <form onSubmit={salvar} className="flex flex-wrap items-center gap-3">
      <input
        value={codigo}
        onChange={(e) => {
          setCodigo(e.target.value);
          setSalvo(false);
        }}
        placeholder="Ex.: AA123456789BR"
        className="min-w-0 flex-1 rounded-md border border-border bg-bg px-3 py-2 font-mono text-sm text-ink outline-none focus:border-ink"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-surface disabled:opacity-60"
      >
        {isPending ? "Salvando..." : "Salvar"}
      </button>
      {salvo && !isPending && (
        <span className="text-sm font-medium text-green-700">Salvo — já aparece pro cliente.</span>
      )}
    </form>
  );
}
