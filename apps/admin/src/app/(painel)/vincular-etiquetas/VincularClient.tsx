"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import jsQR from "jsqr";
import { consultarEtiquetaAction, vincularEtiquetaAction, type SituacaoEtiqueta } from "./actions";

type Produto = { id: string; title: string; variants: { id: string; title: string }[] };

/** Câmera + leitura do QR, inteiramente no aparelho. */
function Leitor({ aoLer, aoFechar }: { aoLer: (texto: string) => void; aoFechar: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let fluxo: MediaStream | null = null;
    let ativo = true;
    let raf = 0;
    const canvas = document.createElement("canvas");

    (async () => {
      if (!navigator.mediaDevices?.getUserMedia) return setErro("Este navegador não permite usar a câmera.");
      try {
        fluxo = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
      } catch (e) {
        const negado = e instanceof DOMException && e.name === "NotAllowedError";
        return setErro(negado ? "Permissão da câmera negada. Libere no navegador." : "Nenhuma câmera encontrada.");
      }
      if (!ativo || !video.current) return fluxo.getTracks().forEach((t) => t.stop());
      video.current.srcObject = fluxo;
      await video.current.play().catch(() => {});
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      let ultimo = 0;
      const ler = (agora: number) => {
        raf = requestAnimationFrame(ler);
        const v = video.current;
        if (!ctx || !v || v.readyState < 2 || agora - ultimo < 120) return;
        ultimo = agora;
        canvas.width = v.videoWidth;
        canvas.height = v.videoHeight;
        ctx.drawImage(v, 0, 0);
        const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const r = jsQR(img.data, img.width, img.height, { inversionAttempts: "dontInvert" });
        if (r?.data) {
          cancelAnimationFrame(raf);
          aoLer(r.data);
        }
      };
      raf = requestAnimationFrame(ler);
    })();

    return () => {
      ativo = false;
      cancelAnimationFrame(raf);
      fluxo?.getTracks().forEach((t) => t.stop());
    };
  }, [aoLer]);

  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      {erro ? (
        <p className="p-3 text-sm text-accent">{erro}</p>
      ) : (
        <div className="relative overflow-hidden rounded bg-black">
          <video ref={video} playsInline muted className="aspect-[4/3] w-full object-cover" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-[18%] rounded border-2 border-accent" />
        </div>
      )}
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-muted">{erro ? "" : "Aponte para o QR da etiqueta."}</span>
        <button type="button" onClick={aoFechar} className="font-medium text-muted hover:text-accent">
          Fechar câmera
        </button>
      </div>
    </div>
  );
}

export function VincularClient({ produtos }: { produtos: Produto[] }) {
  const [camera, setCamera] = useState(false);
  const [situacao, setSituacao] = useState<SituacaoEtiqueta | null>(null);
  const [manual, setManual] = useState("");
  const [produtoId, setProdutoId] = useState("");
  const [varianteId, setVarianteId] = useState("");
  const [pendente, iniciar] = useTransition();

  const consultar = useCallback((texto: string) => {
    setCamera(false);
    setProdutoId("");
    setVarianteId("");
    iniciar(async () => setSituacao(await consultarEtiquetaAction(texto)));
  }, []);

  const produto = produtos.find((p) => p.id === produtoId);

  function vincular() {
    if (situacao?.tipo !== "livre" || !varianteId) return;
    const nome = `${produto?.title ?? ""} — ${produto?.variants.find((v) => v.id === varianteId)?.title ?? ""}`;
    if (!confirm(`Vincular ${situacao.codigo} a "${nome}"?\n\nIsso é definitivo e não poderá ser alterado.`)) return;
    iniciar(async () => setSituacao(await vincularEtiquetaAction(situacao.codigo, varianteId)));
  }

  return (
    <div className="flex flex-col gap-5">
      {camera ? (
        <Leitor aoLer={consultar} aoFechar={() => setCamera(false)} />
      ) : (
        <button
          type="button"
          onClick={() => setCamera(true)}
          className="flex items-center justify-center gap-3 rounded-lg bg-accent px-6 py-5 text-base font-semibold text-white hover:opacity-90"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M4 8h3l2-3h6l2 3h3v11H4V8Zm8 8a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" strokeLinejoin="round" />
          </svg>
          Clique aqui para escanear
        </button>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (manual.trim()) consultar(manual);
        }}
        className="flex gap-2"
      >
        <input
          value={manual}
          onChange={(e) => setManual(e.target.value)}
          placeholder="Ou digite o código (XXXX-XXXX-XXXX)"
          className="flex-1 rounded border border-border bg-bg px-3 py-2 text-sm uppercase text-ink outline-none placeholder:normal-case focus:border-accent"
        />
        <button type="submit" disabled={pendente} className="rounded border border-border px-4 text-sm font-medium text-ink hover:border-accent disabled:opacity-50">
          Consultar
        </button>
      </form>

      {pendente && <p className="text-sm text-muted">Consultando…</p>}

      {!pendente && situacao?.tipo === "erro" && (
        <p className="rounded-lg border border-accent/40 bg-accent/10 p-4 text-sm text-ink">{situacao.mensagem}</p>
      )}

      {!pendente && situacao?.tipo === "vinculada" && (
        <div className="rounded-lg border border-border bg-surface p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="5" y="11" width="14" height="9" rx="2" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" />
            </svg>
            Vinculada — não pode ser alterada
          </div>
          <div className="mt-2 font-mono text-lg font-bold text-ink">{situacao.codigo}</div>
          <div className="mt-1 text-sm text-ink">{situacao.peca}</div>
          <div className="mt-1 text-xs text-muted">Desde {new Date(situacao.desde).toLocaleString("pt-BR")}</div>
        </div>
      )}

      {!pendente && situacao?.tipo === "livre" && (
        <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">Etiqueta nova</div>
            <div className="mt-1 font-mono text-lg font-bold text-ink">{situacao.codigo}</div>
          </div>
          <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-muted">
            Qual camisa é?
            <select
              value={produtoId}
              onChange={(e) => {
                setProdutoId(e.target.value);
                setVarianteId("");
              }}
              className="rounded border border-border bg-bg px-3 py-2 text-sm normal-case tracking-normal text-ink"
            >
              <option value="">Escolha o produto</option>
              {produtos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </label>
          {produto && (
            <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-muted">
              Tamanho / variação
              <select
                value={varianteId}
                onChange={(e) => setVarianteId(e.target.value)}
                className="rounded border border-border bg-bg px-3 py-2 text-sm normal-case tracking-normal text-ink"
              >
                <option value="">Escolha</option>
                {produto.variants.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.title}
                  </option>
                ))}
              </select>
            </label>
          )}
          <button
            type="button"
            onClick={vincular}
            disabled={!varianteId}
            className="rounded bg-accent px-5 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Vincular para sempre
          </button>
        </div>
      )}
    </div>
  );
}
