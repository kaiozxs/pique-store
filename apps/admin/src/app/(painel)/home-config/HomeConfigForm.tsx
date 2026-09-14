"use client";

import { useState, useTransition } from "react";
import type { HomeSection } from "@/lib/home-config";
import { saveHomeSectionsAction } from "./actions";

const TEXT_FIELDS: Partial<Record<HomeSection["type"], { key: string; label: string; multiline?: boolean }[]>> = {
  hero: [
    { key: "headline_line1", label: "Título (linha 1)" },
    { key: "headline_highlight", label: "Título (destaque)" },
    { key: "subtext", label: "Texto", multiline: true },
    { key: "button_label", label: "Texto do botão" },
    { key: "button_href", label: "Link do botão" },
  ],
  apresentacao: [
    { key: "kicker", label: "Chamada pequena" },
    { key: "headline_line1", label: "Título (linha 1)" },
    { key: "headline_line2", label: "Título (linha 2)" },
    { key: "body", label: "Texto", multiline: true },
    { key: "quote", label: "Citação" },
  ],
};

export function HomeConfigForm({ initial }: { initial: HomeSection[] }) {
  const [sections, setSections] = useState(initial);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function toggleVisible(type: HomeSection["type"]) {
    setSections((prev) => prev.map((s) => (s.type === type ? { ...s, visible: !s.visible } : s)));
  }

  function move(index: number, direction: -1 | 1) {
    setSections((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((s, i) => ({ ...s, position: i }));
    });
  }

  function updateConfig(type: HomeSection["type"], key: string, value: string) {
    setSections((prev) =>
      prev.map((s) => (s.type === type ? { ...s, config: { ...(s.config ?? {}), [key]: value } } : s))
    );
  }

  function handleSave() {
    setSaved(false);
    startTransition(async () => {
      await saveHomeSectionsAction(
        sections.map((s, i) => ({ type: s.type, position: i, visible: s.visible, config: s.config }))
      );
      setSaved(true);
    });
  }

  return (
    <div className="flex max-w-2xl flex-col gap-3">
      {sections.map((section, index) => {
        const fields = TEXT_FIELDS[section.type];
        const isExpanded = expanded === section.type;
        return (
          <div key={section.type} className="rounded-lg border border-border bg-surface">
            <div className="flex items-center gap-3 p-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={section.visible}
                  onChange={() => toggleVisible(section.type)}
                />
                Visível
              </label>
              <div className="flex-1 text-sm font-semibold text-ink">{section.label}</div>
              <button type="button" onClick={() => move(index, -1)} className="text-muted hover:text-ink">
                ↑
              </button>
              <button type="button" onClick={() => move(index, 1)} className="text-muted hover:text-ink">
                ↓
              </button>
              {fields && (
                <button
                  type="button"
                  onClick={() => setExpanded(isExpanded ? null : section.type)}
                  className="text-sm font-medium text-accent"
                >
                  {isExpanded ? "Fechar textos" : "Editar textos"}
                </button>
              )}
            </div>
            {fields && isExpanded && (
              <div className="flex flex-col gap-3 border-t border-border p-4">
                {fields.map((field) => (
                  <div key={field.key} className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted">{field.label}</label>
                    {field.multiline ? (
                      <textarea
                        rows={3}
                        value={section.config?.[field.key] ?? ""}
                        onChange={(e) => updateConfig(section.type, field.key, e.target.value)}
                        className="rounded-md border border-border bg-bg px-3 py-2 text-sm"
                      />
                    ) : (
                      <input
                        value={section.config?.[field.key] ?? ""}
                        onChange={(e) => updateConfig(section.type, field.key, e.target.value)}
                        className="rounded-md border border-border bg-bg px-3 py-2 text-sm"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      <div className="mt-2 flex items-center gap-3">
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
