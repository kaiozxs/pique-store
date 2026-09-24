import { ETAPAS, type StatusPedido } from "@/lib/order-status";

/**
 * As quatro etapas do pedido, como definidas na Política de Pedidos e
 * Acompanhamento: Pedido, Pagamento, Preparação e Transporte.
 *
 * Situações fora do caminho normal (cancelamento, por exemplo) não desenham as
 * quatro etapas — elas substituem a apresentação, e é o que `excecao` marca.
 */
export function LinhaDoTempo({ status }: { status: StatusPedido }) {
  if (status.excecao || status.etapa === null) {
    return (
      <div className="border border-white/15 bg-white/[0.03] px-5 py-4">
        <div className="text-sm font-bold tracking-[0.08em] text-paper/80">
          {status.rotulo.toUpperCase()}
        </div>
        <p className="mt-1 text-sm text-paper/55">{status.descricao}</p>
      </div>
    );
  }

  const atual = status.etapa;

  return (
    <div>
      <ol className="flex items-start">
        {ETAPAS.map(({ etapa, titulo }, i) => {
          const concluida = etapa < atual;
          const ativa = etapa === atual;
          const alcancada = concluida || ativa;

          return (
            <li key={etapa} className="flex min-w-0 flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                {/* Metade esquerda do trilho: só existe a partir da segunda
                    etapa, senão sobra um traço solto antes da primeira. */}
                <div
                  className={`h-px flex-1 ${i === 0 ? "bg-transparent" : concluida || ativa ? "bg-accent" : "bg-white/15"}`}
                />
                <div
                  aria-hidden="true"
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold ${
                    alcancada ? "border-accent bg-accent text-paper" : "border-white/25 text-paper/35"
                  }`}
                >
                  {concluida ? "✓" : etapa}
                </div>
                <div
                  className={`h-px flex-1 ${
                    i === ETAPAS.length - 1 ? "bg-transparent" : concluida ? "bg-accent" : "bg-white/15"
                  }`}
                />
              </div>
              <div
                className={`mt-2.5 px-1 text-center text-[11px] font-bold tracking-[0.08em] ${
                  alcancada ? "text-paper" : "text-paper/35"
                }`}
              >
                {titulo.toUpperCase()}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 border-l-2 border-accent pl-4">
        <div className="text-sm font-bold tracking-[0.06em]">{status.rotulo}</div>
        <p className="mt-1 text-sm leading-relaxed text-paper/60">{status.descricao}</p>
      </div>
    </div>
  );
}
