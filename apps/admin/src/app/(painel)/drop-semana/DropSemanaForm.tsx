"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import type { ProductOption } from "@/lib/products";
import { saveDropWeekAction, searchProductsAction } from "./actions";

type SelectedProduct = ProductOption;

export function DropSemanaForm({
  initialTitle,
  initialStatus,
  initialItems,
}: {
  initialTitle: string;
  initialStatus: "draft" | "published";
  initialItems: SelectedProduct[];
}) {
  const [title, setTitle] = useState(initialTitle);
  const [status, setStatus] = useState<"draft" | "published">(initialStatus);
  const [items, setItems] = useState<SelectedProduct[]>(initialItems);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductOption[]>([]);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  async function handleSearch(value: string) {
    setQuery(value);
    if (!value.trim()) {
      setResults([]);
      return;
    }
    const found = await searchProductsAction(value);
    setResults(found.filter((p) => !items.some((i) => i.id === p.id)));
  }

  function addProduct(product: ProductOption) {
    setItems((prev) => [...prev, product]);
    setResults((prev) => prev.filter((p) => p.id !== product.id));
    setQuery("");
  }

  function removeProduct(id: string) {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }

  function move(index: number, direction: -1 | 1) {
    setItems((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function handleSave() {
    setSaved(false);
    startTransition(async () => {
      await saveDropWeekAction({
        title: title || null,
        status,
        product_ids: items.map((i) => i.id),
      });
      setSaved(true);
    });
  }

  return (
    <div className="flex max-w-2xl flex-col gap-5">
      <div className="flex gap-4">
        <div className="flex flex-1 flex-col gap-1.5">
          <label className="text-sm font-medium text-ink">Título</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="ex: Drop da Semana #12"
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-ink">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "draft" | "published")}
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm"
          >
            <option value="draft">Rascunho</option>
            <option value="published">Publicado</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-ink">Produtos (em ordem de exibição)</label>
        <div className="flex flex-col gap-2 rounded-md border border-border bg-surface p-2">
          {items.length === 0 && <div className="p-2 text-sm text-muted">Nenhum produto ainda.</div>}
          {items.map((item, index) => (
            <div key={item.id} className="flex items-center gap-3 rounded-md bg-bg p-2">
              {item.thumbnail && (
                <Image
                  src={item.thumbnail}
                  alt={item.title}
                  width={36}
                  height={36}
                  style={{ width: 36, height: 36 }}
                  className="rounded object-cover"
                />
              )}
              <div className="flex-1 text-sm text-ink">{item.title}</div>
              <button type="button" onClick={() => move(index, -1)} className="text-muted hover:text-ink">
                ↑
              </button>
              <button type="button" onClick={() => move(index, 1)} className="text-muted hover:text-ink">
                ↓
              </button>
              <button type="button" onClick={() => removeProduct(item.id)} className="text-sm text-danger">
                Remover
              </button>
            </div>
          ))}
        </div>

        <div className="relative">
          <input
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Buscar produto pra adicionar..."
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
          />
          {results.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-surface shadow-lg">
              {results.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => addProduct(product)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-bg"
                >
                  {product.title}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={isPending}
          onClick={handleSave}
          className="w-fit rounded-md bg-accent px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isPending ? "Salvando..." : "Salvar"}
        </button>
        {saved && !isPending && <span className="text-sm text-success">Salvo.</span>}
      </div>
    </div>
  );
}
