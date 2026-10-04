"use client";

import { useState, useTransition } from "react";
import type { AcessoPainel } from "@/lib/acessos";
import type { Papel } from "@/lib/papel";
import { concederAcessoAction, revogarAcessoAction } from "./actions";

export function AcessosClient({ acessos }: { acessos: AcessoPainel[] }) {
  const [email, setEmail] = useState("");
  const [papel, setPapel] = useState<Papel>("lojista");
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();

  function conceder(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    iniciar(async () => {
      const r = await concederAcessoAction(email, papel);
      if (r.ok) setEmail("");
      else setErro(r.error);
    });
  }

  function revogar(a: AcessoPainel) {
    if (!confirm(`Tirar o acesso de ${a.email ?? "esta pessoa"}?`)) return;
    setErro(null);
    iniciar(async () => {
      const r = await revogarAcessoAction(a.id);
      if (!r.ok && r.error) setErro(r.error);
    });
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <form onSubmit={conceder} className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-surface p-5">
        <label className="flex min-w-60 flex-1 flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-muted">
          E-mail da conta na loja
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded border border-border bg-bg px-3 py-2 text-sm normal-case tracking-normal text-ink outline-none focus:border-accent"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-muted">
          Papel
          <select
            value={papel}
            onChange={(e) => setPapel(e.target.value as Papel)}
            className="rounded border border-border bg-bg px-3 py-2 text-sm normal-case tracking-normal text-ink"
          >
            <option value="lojista">Lojista</option>
            <option value="dono">Dono</option>
          </select>
        </label>
        <button
          type="submit"
          disabled={pendente}
          className="rounded bg-accent px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          Conceder acesso
        </button>
      </form>

      {erro && (
        <p role="alert" className="text-sm text-accent">
          {erro}
        </p>
      )}

      <div className="rounded-lg border border-border bg-surface">
        {acessos.length === 0 ? (
          <p className="p-5 text-sm text-muted">Nenhum acesso concedido pelo site ainda.</p>
        ) : (
          <ul className="divide-y divide-border">
            {acessos.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-ink">{a.nome ?? a.email}</div>
                  {a.nome && <div className="truncate text-xs text-muted">{a.email}</div>}
                </div>
                <span className="rounded border border-border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
                  {a.papel}
                </span>
                <button
                  type="button"
                  onClick={() => revogar(a)}
                  disabled={pendente}
                  className="text-sm font-medium text-muted hover:text-accent disabled:opacity-50"
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
