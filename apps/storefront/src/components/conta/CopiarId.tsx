"use client";

import { useState } from "react";

/** Botão de copiar o ID pessoal — útil para passar ao atendimento. */
export function CopiarId({ id, className = "" }: { id: string; className?: string }) {
  const [copiado, setCopiado] = useState(false);

  function copiar() {
    // Jeito antigo, para navegador sem acesso à área de transferência.
    const alternativo = () => {
      const campo = document.createElement("textarea");
      campo.value = id;
      document.body.appendChild(campo);
      campo.select();
      document.execCommand("copy");
      campo.remove();
    };
    // Sem esperar a promessa: em alguns navegadores (embutidos de apps) ela
    // fica pendurada pedindo permissão e a confirmação nunca aparecia.
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(id).catch(alternativo);
    else alternativo();

    setCopiado(true);
    setTimeout(() => setCopiado(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={copiar}
      aria-label={copiado ? "ID copiado" : `Copiar ID ${id}`}
      title={copiado ? "Copiado!" : "Copiar ID"}
      className={`toque-leve inline-flex h-7 w-7 shrink-0 items-center justify-center text-paper/45 transition-colors hover:text-accent ${className}`}
    >
      {copiado ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-accent">
          <path d="M5 12l5 5L20 7" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="9" y="9" width="11" height="11" rx="2" />
          <path d="M5 15V5a2 2 0 0 1 2-2h10" />
        </svg>
      )}
      <span aria-live="polite" className="sr-only">
        {copiado ? "ID copiado" : ""}
      </span>
    </button>
  );
}
