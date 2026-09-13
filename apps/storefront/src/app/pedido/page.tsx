import type { Metadata } from "next";

export const metadata: Metadata = { title: "Acompanhe seu pedido — PIQUE" };

export default function PedidoPage() {
  return (
    <div className="mx-auto min-h-[70vh] max-w-xl px-6 py-24 sm:px-8">
      <div className="mb-4 text-[13px] font-semibold tracking-[0.28em] text-ink/50">RASTREIO</div>
      <h1 className="mb-6 font-display text-3xl tracking-tight sm:text-4xl">ACOMPANHE SEU PEDIDO</h1>
      <p className="mb-8 text-sm leading-relaxed text-ink/60">
        Informe o número do seu pedido para consultar o status e as informações de envio.
      </p>
      <form className="flex flex-col gap-4 sm:flex-row">
        <label htmlFor="numero-pedido" className="sr-only">
          Número do pedido
        </label>
        <input
          id="numero-pedido"
          type="text"
          placeholder="Nº do pedido"
          className="flex-1 border border-ink/20 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-ink/35"
        />
        <button
          type="submit"
          className="border border-ink bg-ink px-7 py-3 text-[13px] font-bold tracking-[0.12em] text-paper transition-colors hover:bg-accent hover:border-accent"
        >
          CONSULTAR
        </button>
      </form>
      <p className="mt-4 text-xs text-ink/40">
        Consulta em desenvolvimento — em breve integrada à sua conta e ao status real do pedido.
      </p>
    </div>
  );
}
