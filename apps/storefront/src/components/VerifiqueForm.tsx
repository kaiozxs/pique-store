"use client";

import { useState } from "react";
import { verifyPiece, type PieceVerification } from "@/lib/medusa";

const STATUS_LABEL: Record<NonNullable<PieceVerification["status"]>, string> = {
  nao_registrado: "Não registrado ainda",
  registrado: "Registrado",
  revogado: "Revogado",
};

export function VerifiqueForm() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PieceVerification | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await verifyPiece(code.trim());
      setResult(data);
    } catch {
      setError("Não foi possível verificar agora. Tente novamente em instantes.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row">
        <label htmlFor="codigo-peca" className="sr-only">
          Código da peça
        </label>
        <input
          id="codigo-peca"
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Código da peça"
          className="flex-1 border border-white/20 bg-transparent px-4 py-3 text-sm uppercase tracking-widest outline-none placeholder:text-paper/35 placeholder:normal-case placeholder:tracking-normal"
        />
        <button
          type="submit"
          disabled={loading}
          className="border border-accent bg-accent px-7 py-3 text-[13px] font-bold tracking-[0.12em] text-paper transition-colors hover:bg-paper hover:text-ink disabled:opacity-60"
        >
          {loading ? "VERIFICANDO..." : "VERIFICAR"}
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-accent">{error}</p>}

      {result && (
        <div className="mt-8 border border-white/15 p-6">
          {!result.valid ? (
            <p className="text-sm font-semibold text-accent">
              {result.status === "revogado"
                ? "Este código foi revogado e não é mais válido."
                : "Código não encontrado. Confira se digitou corretamente."}
            </p>
          ) : (
            <>
              <p className="text-sm font-semibold text-accent">Peça autêntica ✓</p>
              {result.product && (
                <p className="mt-2 text-sm text-paper/70">
                  {result.product.title} — {result.product.variant_title}
                </p>
              )}
              {result.status && (
                <p className="mt-2 text-xs uppercase tracking-widest text-paper/45">
                  {STATUS_LABEL[result.status]}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
