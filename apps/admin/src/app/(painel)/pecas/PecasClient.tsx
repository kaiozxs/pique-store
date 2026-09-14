"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import type { PieceUnit, ProductWithVariants } from "@/lib/pecas";
import { createPieceUnitsAction, deletePieceUnitAction } from "./actions";

const STATUS_LABEL: Record<PieceUnit["status"], string> = {
  nao_registrado: "Não registrado",
  registrado: "Registrado",
  revogado: "Revogado",
};

export function PecasClient({
  initial,
  products,
}: {
  initial: PieceUnit[];
  products: ProductWithVariants[];
}) {
  const router = useRouter();
  const [pieces, setPieces] = useState(initial);
  useEffect(() => setPieces(initial), [initial]);
  const [productId, setProductId] = useState("");
  const [variantId, setVariantId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [isPending, startTransition] = useTransition();

  const variants = useMemo(() => products.find((p) => p.id === productId)?.variants ?? [], [products, productId]);

  function handleCreate() {
    if (!variantId) return;
    startTransition(async () => {
      await createPieceUnitsAction({ product_variant_id: variantId, quantity: Number(quantity) });
      setQuantity("1");
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deletePieceUnitAction(id);
      setPieces((prev) => prev.filter((p) => p.id !== id));
    });
  }

  return (
    <div>
      <h1 className="mb-2 text-xl font-bold text-ink">Verifique seu PIQUE</h1>
      <p className="mb-6 text-sm text-muted">
        Gere identificadores únicos por unidade física e acompanhe titularidade.
      </p>

      <div className="mb-6 flex flex-wrap items-end gap-3 rounded-lg border border-border bg-surface p-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted">Produto</label>
          <select
            value={productId}
            onChange={(e) => {
              setProductId(e.target.value);
              setVariantId("");
            }}
            className="w-56 rounded-md border border-border bg-bg px-3 py-2 text-sm"
          >
            <option value="">Selecione o produto</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted">Variante</label>
          <select
            value={variantId}
            onChange={(e) => setVariantId(e.target.value)}
            disabled={!productId}
            className="w-40 rounded-md border border-border bg-bg px-3 py-2 text-sm disabled:opacity-50"
          >
            <option value="">Selecione a variante</option>
            {variants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted">Quantidade</label>
          <input
            type="number"
            min={1}
            max={500}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-20 rounded-md border border-border bg-bg px-3 py-2 text-sm"
          />
        </div>

        <button
          type="button"
          disabled={!variantId || isPending}
          onClick={handleCreate}
          className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isPending ? "Gerando..." : "Gerar peças"}
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg text-left text-xs font-semibold uppercase tracking-wide text-muted">
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Variante</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Titular</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {pieces.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted">
                  Nenhuma peça gerada ainda.
                </td>
              </tr>
            )}
            {pieces.map((piece) => (
              <tr key={piece.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-mono text-ink">{piece.unique_code}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted">{piece.product_variant_id}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      piece.status === "registrado"
                        ? "bg-success/15 text-success"
                        : piece.status === "revogado"
                          ? "bg-danger/15 text-danger"
                          : "bg-bg text-muted"
                    }`}
                  >
                    {STATUS_LABEL[piece.status]}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted">
                  {piece.current_owner_customer_id ?? "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleDelete(piece.id)}
                    className="text-sm font-medium text-danger"
                  >
                    Remover
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
