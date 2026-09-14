import type { Metadata } from "next";
import { VerifiqueForm } from "@/components/VerifiqueForm";

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
        <VerifiqueForm />
        <p className="mt-4 text-xs text-paper/40">
          Nenhum dado pessoal é exibido publicamente nessa consulta.
        </p>
      </div>
    </div>
  );
}
