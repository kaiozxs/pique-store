"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Modal } from "@/components/Modal";
import type { FaqItem, FaqItemInput } from "@/lib/faq";
import { createFaqItemAction, deleteFaqItemAction, updateFaqItemAction } from "./actions";

const EMPTY_FORM: FaqItemInput = { category: "", question: "", answer: "", published: true };

function FaqForm({ form, setForm }: { form: FaqItemInput; setForm: (f: FaqItemInput) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-ink">Categoria</label>
        <input
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          placeholder="ex: Pedidos, Trocas"
          className="rounded-md border border-border bg-bg px-3 py-2 text-sm"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-ink">Pergunta</label>
        <input
          value={form.question}
          onChange={(e) => setForm({ ...form, question: e.target.value })}
          className="rounded-md border border-border bg-bg px-3 py-2 text-sm"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-ink">Resposta</label>
        <textarea
          rows={5}
          value={form.answer}
          onChange={(e) => setForm({ ...form, answer: e.target.value })}
          className="rounded-md border border-border bg-bg px-3 py-2 text-sm"
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={form.published}
          onChange={(e) => setForm({ ...form, published: e.target.checked })}
        />
        Publicada
      </label>
    </div>
  );
}

export function FaqClient({ initial }: { initial: FaqItem[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  useEffect(() => setItems(initial), [initial]);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<FaqItemInput>(EMPTY_FORM);
  const [editing, setEditing] = useState<FaqItem | null>(null);
  const [editForm, setEditForm] = useState<FaqItemInput>(EMPTY_FORM);
  const [isPending, startTransition] = useTransition();

  function openEdit(item: FaqItem) {
    setEditing(item);
    setEditForm({
      category: item.category,
      question: item.question,
      answer: item.answer,
      position: item.position,
      published: item.published,
    });
  }

  function handleCreate() {
    startTransition(async () => {
      await createFaqItemAction(createForm);
      setCreateOpen(false);
      setCreateForm(EMPTY_FORM);
      router.refresh();
    });
  }

  function handleUpdate() {
    if (!editing) return;
    startTransition(async () => {
      await updateFaqItemAction(editing.id, editForm);
      setEditing(null);
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteFaqItemAction(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    });
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-ink">FAQ</h1>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white"
        >
          Criar pergunta
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg text-left text-xs font-semibold uppercase tracking-wide text-muted">
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Pergunta</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted">
                  Nenhuma pergunta criada ainda.
                </td>
              </tr>
            )}
            {items.map((item) => (
              <tr key={item.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-muted">{item.category}</td>
                <td className="px-4 py-3 text-ink">{item.question}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      item.published ? "bg-success/15 text-success" : "bg-bg text-muted"
                    }`}
                  >
                    {item.published ? "Publicada" : "Oculta"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button type="button" onClick={() => openEdit(item)} className="mr-3 text-sm font-medium text-accent">
                    Editar
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleDelete(item.id)}
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

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Criar pergunta"
        footer={
          <>
            <button type="button" onClick={() => setCreateOpen(false)} className="rounded-md border border-border px-4 py-2 text-sm">
              Cancelar
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={handleCreate}
              className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {isPending ? "Criando..." : "Criar"}
            </button>
          </>
        }
      >
        <FaqForm form={createForm} setForm={setCreateForm} />
      </Modal>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Editar pergunta"
        footer={
          <>
            <button type="button" onClick={() => setEditing(null)} className="rounded-md border border-border px-4 py-2 text-sm">
              Cancelar
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={handleUpdate}
              className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {isPending ? "Salvando..." : "Salvar"}
            </button>
          </>
        }
      >
        <FaqForm form={editForm} setForm={setEditForm} />
      </Modal>
    </div>
  );
}
