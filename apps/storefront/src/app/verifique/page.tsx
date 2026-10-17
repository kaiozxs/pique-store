import type { Metadata } from "next";
import { VerifiqueForm } from "@/components/VerifiqueForm";

export const metadata: Metadata = { title: "Verifique seu PIQUE — PIQUE" };

export default async function VerifiquePage({ searchParams }: PageProps<"/verifique">) {
  const { codigo } = await searchParams;
  const inicial = typeof codigo === "string" ? codigo.slice(0, 40) : undefined;
  return (
    <div className="bg-ink text-paper">
      <div className="mx-auto min-h-[70vh] max-w-3xl px-6 py-24 sm:px-8">
        <div className="mb-4 text-[13px] font-semibold tracking-[0.28em] text-paper/55">AUTENTICIDADE</div>
        <h1 className="mb-6 font-display text-3xl tracking-wide sm:text-4xl">VERIFIQUE SEU PIQUE</h1>
        <p className="mb-8 text-sm leading-relaxed text-paper/65">
          Cada peça PIQUE tem um identificador único. Digite o código ou leia o QR da etiqueta para
          confirmar a autenticidade e ver a quem a peça pertence.
        </p>
        <VerifiqueForm codigoInicial={inicial} />
        <p className="mt-4 text-xs text-paper/40">
          Só aparece o ID pessoal de quem comprou — nunca nome, e-mail ou endereço.
        </p>
      </div>
    </div>
  );
}
