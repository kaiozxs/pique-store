import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrder } from "@/lib/orders";
import { listPiecesByOrder, qrSvg } from "@/lib/etiquetas";
import { ImprimirBotao } from "./ImprimirBotao";

/**
 * Folha de etiquetas do pedido: um QR + código por peça, para anexar à tag
 * de cada roupa. Fundo branco e grade simples porque é feita para imprimir.
 */
export default async function EtiquetasPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [order, pecas] = await Promise.all([getOrder(id), listPiecesByOrder(id)]);
  if (!order) notFound();

  const porVariante = new Map(
    (order.items ?? []).map((i) => [i.variant_id, `${i.product_title ?? ""}${i.variant_title ? ` — ${i.variant_title}` : ""}`])
  );
  const etiquetas = await Promise.all(
    pecas.map(async (p) => ({ ...p, svg: await qrSvg(p.unique_code), nome: porVariante.get(p.product_variant_id) ?? "Peça PIQUE" }))
  );

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <div>
          <Link href={`/pedidos/${id}`} className="text-sm text-muted hover:text-accent">
            ← Pedido #{order.display_id}
          </Link>
          <h1 className="mt-1 font-display text-2xl uppercase tracking-tight text-ink">Etiquetas</h1>
        </div>
        {etiquetas.length > 0 && <ImprimirBotao />}
      </div>

      {etiquetas.length === 0 ? (
        <p className="rounded-lg border border-border bg-surface p-6 text-sm text-muted">
          Este pedido ainda não tem códigos. Eles são gerados automaticamente quando a compra é concluída;
          pedidos feitos antes dessa regra não têm.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 print:grid-cols-3 print:gap-3">
          {etiquetas.map((e) => (
            <div key={e.id} className="break-inside-avoid rounded-md border border-neutral-300 bg-white p-4 text-center text-black">
              <div className="text-[10px] font-bold tracking-[0.2em]">PIQUE · ORIGINAL</div>
              <div className="mx-auto my-2 w-32" dangerouslySetInnerHTML={{ __html: e.svg }} />
              <div className="font-mono text-sm font-bold tracking-wider">{e.unique_code}</div>
              <div className="mt-1 truncate text-[10px] text-neutral-600">{e.nome}</div>
              <div className="mt-1 text-[9px] text-neutral-500">Verifique em pique-store-seven.vercel.app/verifique</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
