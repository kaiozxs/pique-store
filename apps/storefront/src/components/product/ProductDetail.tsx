"use client";

import { useMemo, useState } from "react";
import type { Produto } from "@/lib/sample-data";
import { formatPreco } from "@/lib/sample-data";

const GARMENT_ICON_PATH =
  "M4 7.2 L8.2 4 L10 5.6 L14 5.6 L15.8 4 L20 7.2 L17.8 10.4 L16 9.3 L16 20 L8 20 L8 9.3 L6.2 10.4 Z";

export function ProductDetail({ produto }: { produto: Produto }) {
  const cores = useMemo(
    () => Array.from(new Set(produto.variantes.map((v) => v.cor))),
    [produto]
  );
  const tamanhos = useMemo(
    () => Array.from(new Set(produto.variantes.map((v) => v.tamanho))),
    [produto]
  );

  const [cor, setCor] = useState(cores[0]);
  const [tamanho, setTamanho] = useState(tamanhos[0]);
  const [favorito, setFavorito] = useState(false);

  const varianteSelecionada = produto.variantes.find((v) => v.cor === cor && v.tamanho === tamanho);
  const disponivel = varianteSelecionada?.disponibilidade === "DISPONIVEL";

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-16 px-6 py-16 sm:px-8 lg:grid-cols-2 lg:gap-20">
      <div className="flex flex-col gap-4">
        <div className="relative flex aspect-[3/4] flex-col items-center justify-center gap-4 border border-dashed border-white/20 bg-[#161617]">
          {produto.badge && (
            <div className="absolute left-4 top-4 bg-accent px-3 py-1.5 text-[11px] font-bold tracking-[0.1em] text-paper">
              {produto.badge}
            </div>
          )}
          <svg width="72" height="72" viewBox="0 0 24 24" aria-hidden="true" className="text-paper/30">
            <path d={GARMENT_ICON_PATH} fill="none" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" strokeLinecap="round" />
          </svg>
          <div className="text-xs tracking-[0.08em] text-paper/45">[FOTOS DO PRODUTO]</div>
        </div>
      </div>

      <div>
        <div className="mb-2 text-[13px] font-semibold tracking-[0.2em] text-paper/50">{produto.categoria}</div>
        <h1 className="font-display text-3xl tracking-tight sm:text-4xl">{produto.nome}</h1>

        <div className="mt-5 flex items-baseline gap-3 text-xl font-semibold">
          {produto.precoPromocionalCentavos ? (
            <>
              <span className="text-accent">{formatPreco(produto.precoPromocionalCentavos)}</span>
              <span className="text-base text-paper/40 line-through">{formatPreco(produto.precoCentavos)}</span>
            </>
          ) : (
            <span>{formatPreco(produto.precoCentavos)}</span>
          )}
        </div>

        {produto.preVenda && (
          <div className="mt-5 border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-paper/85">
            <span className="font-bold text-accent">PRÉ-VENDA — </span>
            {produto.preVenda.mensagem} Prazo estimado: {produto.preVenda.prazoEstimado}.
          </div>
        )}

        <p className="mt-7 text-sm leading-relaxed text-paper/70">{produto.descricao}</p>

        <div className="mt-8">
          <div className="mb-2 text-xs font-bold tracking-[0.1em] text-paper/60">COR</div>
          <div className="flex flex-wrap gap-2">
            {cores.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCor(c)}
                className={`border px-4 py-2 text-sm transition-colors ${
                  c === cor ? "border-accent text-accent" : "border-white/25 hover:border-white/50"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-2 text-xs font-bold tracking-[0.1em] text-paper/60">TAMANHO</div>
          <div className="flex flex-wrap gap-2">
            {tamanhos.map((t) => {
              const variante = produto.variantes.find((v) => v.cor === cor && v.tamanho === t);
              const habilitado = variante?.disponibilidade === "DISPONIVEL";
              return (
                <button
                  key={t}
                  type="button"
                  disabled={!variante}
                  onClick={() => setTamanho(t)}
                  className={`border px-4 py-2 text-sm transition-colors ${
                    t === tamanho ? "border-accent text-accent" : "border-white/25 hover:border-white/50"
                  } ${!habilitado ? "text-paper/25 line-through" : ""}`}
                >
                  {t}
                </button>
              );
            })}
          </div>
          {!disponivel && (
            <div className="mt-2 text-xs font-semibold tracking-[0.05em] text-paper/50">
              INDISPONÍVEL nesta combinação de cor/tamanho.
            </div>
          )}
        </div>

        <div className="mt-9 flex flex-wrap items-center gap-4">
          <button
            type="button"
            disabled={!disponivel}
            className="border border-accent bg-accent px-8 py-4 text-[13px] font-bold tracking-[0.12em] text-paper transition-colors hover:bg-paper hover:text-ink disabled:cursor-not-allowed disabled:border-white/20 disabled:bg-transparent disabled:text-paper/40 disabled:hover:bg-transparent disabled:hover:text-paper/40"
          >
            {disponivel ? "ADICIONAR À SACOLA" : "INDISPONÍVEL"}
          </button>
          <button
            type="button"
            onClick={() => setFavorito((f) => !f)}
            aria-pressed={favorito}
            className={`border px-5 py-4 text-[13px] font-bold tracking-[0.1em] transition-colors ${
              favorito ? "border-accent text-accent" : "border-white/25 hover:border-white/50"
            }`}
          >
            {favorito ? "★ FAVORITADO" : "☆ FAVORITAR"}
          </button>
        </div>

        <div className="mt-14 border-t border-white/10 pt-8">
          <div className="mb-4 text-xs font-bold tracking-[0.1em] text-paper/60">DETALHES DA PEÇA</div>
          <ul className="flex flex-col gap-2 text-sm leading-relaxed text-paper/70">
            {produto.detalhes.map((d) => (
              <li key={d}>— {d}</li>
            ))}
          </ul>
        </div>

        <div className="mt-10">
          <div className="mb-4 text-xs font-bold tracking-[0.1em] text-paper/60">TABELA DE MEDIDAS</div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[320px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-white/15 text-paper/50">
                  <th className="py-2 pr-4 font-semibold">Tamanho</th>
                  <th className="py-2 pr-4 font-semibold">Largura</th>
                  <th className="py-2 font-semibold">Comprimento</th>
                </tr>
              </thead>
              <tbody>
                {produto.medidas.map((m) => (
                  <tr key={m.tamanho} className="border-b border-white/5">
                    <td className="py-2 pr-4">{m.tamanho}</td>
                    <td className="py-2 pr-4">{m.largura}</td>
                    <td className="py-2">{m.comprimento}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
