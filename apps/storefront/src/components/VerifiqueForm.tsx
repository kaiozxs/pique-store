"use client";

import { useCallback, useState } from "react";
import { LeitorQR } from "./LeitorQR";
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

  const [camera, setCamera] = useState(false);

  async function verificar(valor: string) {
    if (!valor.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await verifyPiece(valor.trim());
      setResult(data);
    } catch {
      setError("Não foi possível verificar agora. Tente novamente em instantes.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    verificar(code);
  }

  const aoLer = useCallback((lido: string) => {
    setCamera(false);
    setCode(lido);
    verificar(lido);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          className="btn-preenche border border-accent px-7 py-3 text-[13px] font-bold tracking-[0.12em] text-paper disabled:opacity-60"
        >
          {loading ? "VERIFICANDO..." : "VERIFICAR"}
        </button>
      </form>

      {camera ? (
        <LeitorQR aoLer={aoLer} aoFechar={() => setCamera(false)} />
      ) : (
        <button
          type="button"
          onClick={() => setCamera(true)}
          className="toque mt-4 flex w-full items-center justify-center gap-3 border border-white/25 px-5 py-3 text-[12px] font-bold tracking-[0.12em] hover:border-white sm:w-auto"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <path d="M4 8h3l2-3h6l2 3h3v11H4V8Zm8 8a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" strokeLinejoin="round" />
          </svg>
          LER QR COM A CÂMERA
        </button>
      )}

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
