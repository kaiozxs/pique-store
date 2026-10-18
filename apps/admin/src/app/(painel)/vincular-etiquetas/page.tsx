import { listProductsWithVariants } from "@/lib/pecas";
import { VincularClient } from "./VincularClient";

export default async function VincularEtiquetasPage() {
  const produtos = await listProductsWithVariants();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-2 font-display text-2xl uppercase tracking-tight text-ink">Vincular etiquetas</h1>
      <p className="mb-6 text-sm text-muted">
        Leia o QR da etiqueta e diga qual peça ela é. <strong className="text-ink">O vínculo é definitivo</strong>: depois
        de salvo, aquele QR identifica essa peça para sempre e não pode ser trocado.
      </p>
      <VincularClient
        produtos={produtos.map((p) => ({
          id: p.id,
          title: p.title,
          variants: (p.variants ?? []).map((v) => ({ id: v.id, title: v.title })),
        }))}
      />
    </div>
  );
}
