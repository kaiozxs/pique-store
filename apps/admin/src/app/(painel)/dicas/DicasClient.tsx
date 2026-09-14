"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Modal } from "@/components/Modal";
import type { TipPost, TipPostInput, TipStatus } from "@/lib/dicas";
import { createTipPostAction, deleteTipPostAction, updateTipPostAction } from "./actions";

const EMPTY_FORM: TipPostInput = {
  title: "",
  slug: "",
  excerpt: null,
  body: "",
  cover_image: null,
  status: "draft",
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function TipForm({
  form,
  setForm,
  slugTouched,
  setSlugTouched,
}: {
  form: TipPostInput;
  setForm: (f: TipPostInput) => void;
  slugTouched: boolean;
  setSlugTouched: (v: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-ink">Título</label>
        <input
          value={form.title}
          onChange={(e) => {
            const title = e.target.value;
            setForm({ ...form, title, slug: slugTouched ? form.slug : slugify(title) });
          }}
          className="rounded-md border border-border bg-bg px-3 py-2 text-sm"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-ink">Slug (URL)</label>
        <input
          value={form.slug}
          onChange={(e) => {
            setSlugTouched(true);
            setForm({ ...form, slug: e.target.value });
          }}
          className="rounded-md border border-border bg-bg px-3 py-2 text-sm"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-ink">Resumo</label>
        <input
          value={form.excerpt ?? ""}
          onChange={(e) => setForm({ ...form, excerpt: e.target.value || null })}
          className="rounded-md border border-border bg-bg px-3 py-2 text-sm"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-ink">Texto</label>
        <textarea
          rows={8}
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
          className="rounded-md border border-border bg-bg px-3 py-2 text-sm"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-ink">Imagem de capa (URL)</label>
        <input
          value={form.cover_image ?? ""}
          onChange={(e) => setForm({ ...form, cover_image: e.target.value || null })}
          className="rounded-md border border-border bg-bg px-3 py-2 text-sm"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-ink">Status</label>
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value as TipStatus })}
          className="rounded-md border border-border bg-bg px-3 py-2 text-sm"
        >
          <option value="draft">Rascunho</option>
          <option value="published">Publicado</option>
        </select>
      </div>
    </div>
  );
}

export function DicasClient({ initial }: { initial: TipPost[] }) {
  const router = useRouter();
  const [posts, setPosts] = useState(initial);
  useEffect(() => setPosts(initial), [initial]);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<TipPostInput>(EMPTY_FORM);
  const [createSlugTouched, setCreateSlugTouched] = useState(false);
  const [editing, setEditing] = useState<TipPost | null>(null);
  const [editForm, setEditForm] = useState<TipPostInput>(EMPTY_FORM);
  const [isPending, startTransition] = useTransition();

  function openEdit(post: TipPost) {
    setEditing(post);
    setEditForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      body: post.body,
      cover_image: post.cover_image,
      status: post.status,
    });
  }

  function handleCreate() {
    startTransition(async () => {
      await createTipPostAction(createForm);
      setCreateOpen(false);
      setCreateForm(EMPTY_FORM);
      setCreateSlugTouched(false);
      router.refresh();
    });
  }

  function handleUpdate() {
    if (!editing) return;
    startTransition(async () => {
      await updateTipPostAction(editing.id, editForm);
      setEditing(null);
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteTipPostAction(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    });
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-ink">Dicas</h1>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white"
        >
          Criar dica
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg text-left text-xs font-semibold uppercase tracking-wide text-muted">
              <th className="px-4 py-3">Título</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-muted">
                  Nenhuma dica criada ainda.
                </td>
              </tr>
            )}
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-ink">{post.title}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      post.status === "published" ? "bg-success/15 text-success" : "bg-bg text-muted"
                    }`}
                  >
                    {post.status === "published" ? "Publicado" : "Rascunho"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button type="button" onClick={() => openEdit(post)} className="mr-3 text-sm font-medium text-accent">
                    Editar
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleDelete(post.id)}
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
        title="Criar dica"
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
        <TipForm form={createForm} setForm={setCreateForm} slugTouched={createSlugTouched} setSlugTouched={setCreateSlugTouched} />
      </Modal>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Editar dica"
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
        <TipForm form={editForm} setForm={setEditForm} slugTouched setSlugTouched={() => {}} />
      </Modal>
    </div>
  );
}
