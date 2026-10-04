"use client";

import { useEffect, useState } from "react";
import { lerConsentimento, salvarConsentimento, type Consentimento } from "@/lib/consent";

const CATEGORIAS: { chave: keyof Consentimento; titulo: string; texto: string }[] = [
  {
    chave: "preferencias",
    titulo: "Preferências",
    texto: "Lembra como você gosta de ver o catálogo: categoria e ordenação.",
  },
  {
    chave: "analise",
    titulo: "Análise de desempenho",
    texto: "Ajuda a entender quais páginas funcionam e onde o site fica lento. Hoje não usamos nenhuma ferramenta.",
  },
  {
    chave: "marketing",
    titulo: "Publicidade",
    texto: "Permitiria anúncios mais relevantes. Hoje não usamos nenhuma ferramenta.",
  },
];

export function CookiesPainel() {
  const [aberto, setAberto] = useState(false);
  const [detalhe, setDetalhe] = useState(false);
  const [escolha, setEscolha] = useState<Consentimento>({ preferencias: false, analise: false, marketing: false });

  useEffect(() => {
    const atual = lerConsentimento();
    if (atual) setEscolha(atual);
    else setAberto(true);

    function reabrir(e: MouseEvent) {
      const alvo = (e.target as HTMLElement).closest('a[href="#preferencias-cookies"]');
      if (!alvo) return;
      e.preventDefault();
      setEscolha(lerConsentimento() ?? { preferencias: false, analise: false, marketing: false });
      setDetalhe(true);
      setAberto(true);
    }
    document.addEventListener("click", reabrir);
    return () => document.removeEventListener("click", reabrir);
  }, []);

  function decidir(c: Consentimento) {
    salvarConsentimento(c);
    setEscolha(c);
    setAberto(false);
    setDetalhe(false);
  }

  if (!aberto) return null;

  return (
    <div
      role="dialog"
      aria-label="Preferências de cookies"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-white/15 bg-ink/95 px-5 py-5 text-paper backdrop-blur sm:px-8"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4">
        <p className="text-[13px] leading-relaxed text-paper/80">
          Usamos cookies essenciais para o login e a sacola funcionarem. Os demais só são ativados com a sua permissão.{" "}
          <a href="/institucional/politica-de-cookies" className="underline hover:text-paper">
            Política de cookies
          </a>
        </p>

        {detalhe && (
          <ul className="flex flex-col gap-3 border-y border-white/10 py-4">
            <li className="text-[12px] text-paper/55">
              <strong className="font-semibold text-paper/80">Essenciais</strong> — login, sacola e segurança. Sempre ativos.
            </li>
            {CATEGORIAS.map((c) => (
              <li key={c.chave} className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[13px] font-semibold">{c.titulo}</div>
                  <div className="text-[12px] text-paper/55">{c.texto}</div>
                </div>
                <input
                  type="checkbox"
                  role="switch"
                  aria-label={c.titulo}
                  checked={escolha[c.chave]}
                  onChange={(e) => setEscolha({ ...escolha, [c.chave]: e.target.checked })}
                  className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-accent,#c8102e)]"
                />
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap gap-3 text-[12px] font-bold tracking-[0.1em]">
          <button
            type="button"
            onClick={() => decidir({ preferencias: true, analise: true, marketing: true })}
            className="toque border border-accent bg-accent px-5 py-3"
          >
            ACEITAR TODOS
          </button>
          <button
            type="button"
            onClick={() => decidir({ preferencias: false, analise: false, marketing: false })}
            className="toque border border-white/30 px-5 py-3 hover:border-white"
          >
            REJEITAR OPCIONAIS
          </button>
          {detalhe ? (
            <button type="button" onClick={() => decidir(escolha)} className="toque border border-white/30 px-5 py-3 hover:border-white">
              SALVAR ESCOLHA
            </button>
          ) : (
            <button type="button" onClick={() => setDetalhe(true)} className="toque border border-white/30 px-5 py-3 hover:border-white">
              PERSONALIZAR
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
