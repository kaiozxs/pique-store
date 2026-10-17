"use client";

export function ImprimirBotao() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
    >
      Imprimir etiquetas
    </button>
  );
}
