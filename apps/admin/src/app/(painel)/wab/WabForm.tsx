"use client";

import { useState, useTransition } from "react";
import type { WabContent, WabMedia } from "@/lib/wab";
import { saveWabAction } from "./actions";

const STATUS_OPTIONS: { value: WabContent["status"]; label: string }[] = [
  { value: "em_construcao", label: "Em construção" },
  { value: "revelado", label: "Revelado" },
  { value: "oculto", label: "Oculto" },
];

export function WabForm({ initial }: { initial: WabContent }) {
  const [status, setStatus] = useState(initial.status);
  const [title, setTitle] = useState(initial.title ?? "");
  const [body, setBody] = useState(initial.body ?? "");
  const [media, setMedia] = useState<WabMedia[]>(initial.media?.items ?? []);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function addMedia() {
    setMedia((prev) => [...prev, { url: "", type: "image" }]);
  }

  function updateMedia(index: number, patch: Partial<WabMedia>) {
    setMedia((prev) => prev.map((m, i) => (i === index ? { ...m, ...patch } : m)));
  }

  function removeMedia(index: number) {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSave() {
    setSaved(false);
    startTransition(async () => {
      await saveWabAction({
        status,
        title: title || null,
        body: body || null,
        media: media.length > 0 ? { items: media.filter((m) => m.url.trim()) } : null,
      });
      setSaved(true);
    });
  }

  return (
    <div className="flex max-w-2xl flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-ink">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as WabContent["status"])}
          className="rounded-md border border-border bg-surface px-3 py-2 text-sm"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-ink">Título</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-md border border-border bg-surface px-3 py-2 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-ink">Texto</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          className="rounded-md border border-border bg-surface px-3 py-2 text-sm"
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-ink">Mídia</label>
          <button type="button" onClick={addMedia} className="text-sm font-medium text-accent">
            + adicionar
          </button>
        </div>
        {media.map((item, index) => (
          <div key={index} className="flex gap-2">
            <input
              value={item.url}
              onChange={(e) => updateMedia(index, { url: e.target.value })}
              placeholder="https://..."
              className="flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm"
            />
            <select
              value={item.type}
              onChange={(e) => updateMedia(index, { type: e.target.value as WabMedia["type"] })}
              className="rounded-md border border-border bg-surface px-3 py-2 text-sm"
            >
              <option value="image">Imagem</option>
              <option value="video">Vídeo</option>
            </select>
            <button
              type="button"
              onClick={() => removeMedia(index)}
              className="rounded-md border border-border px-3 py-2 text-sm text-danger"
            >
              Remover
            </button>
          </div>
        ))}
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
