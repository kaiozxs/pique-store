import type { Metadata } from "next";

export const metadata: Metadata = { title: "Verifique seu PIQUE — PIQUE" };

export default function VerifiquePage() {
  return (
    <div className="bg-ink text-paper">
      <div className="mx-auto min-h-[70vh] max-w-xl px-6 py-24 sm:px-8">
        <div className="mb-4 text-[13px] font-semibold tracking-[0.28em] text-paper/55">AUTENTICIDADE</div>
        <h1 className="mb-6 font-display text-3xl tracking-tight sm:text-4xl">VERIFIQUE SEU PIQUE</h1>
        <p className="mb-8 text-sm leading-relaxed text-paper/65">
          Cada peça PIQUE tem um identificador único. Digite o código da sua peça para confirmar a
          autenticidade.
        </p>
        <form className="flex flex-col gap-4 sm:flex-row">
          <label htmlFor="codigo-peca" className="sr-only">
            Código da peça
          </label>
          <input
            id="codigo-peca"
            type="text"
            placeholder="Código da peça"
            className="flex-1 border border-white/20 bg-transparent px-4 py-3 text-sm uppercase tracking-widest outline-none placeholder:text-paper/35 placeholder:normal-case placeholder:tracking-normal"
          />
          <button
            type="submit"
            className="border border-accent bg-accent px-7 py-3 text-[13px] font-bold tracking-[0.12em] text-paper transition-colors hover:bg-paper hover:text-ink"
          >
            VERIFICAR
          </button>
        </form>
        <p className="mt-4 text-xs text-paper/40">
          Verificação em desenvolvimento. Nenhum dado pessoal é exibido publicamente nessa consulta.
        </p>
      </div>
    </div>
  );
}
