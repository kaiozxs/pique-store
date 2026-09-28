import { ETAPAS, type EtapaPedido, type StatusPedido } from "@/lib/order-status";

/**
 * As quatro etapas do pedido, como a Política de Pedidos e Acompanhamento
 * define: Pedido, Pagamento, Preparação e Transporte.
 *
 * Os símbolos são os de sempre — recibo, cartão, caixa, caminhão, casa — de
 * propósito: quem acompanha uma entrega já reconhece esses desenhos, e
 * inventar ícone próprio aqui só atrapalharia. A etapa atual se mexe, as
 * concluídas ficam paradas com o visto, e os três pontos entre elas indicam
 * que o pedido está caminhando pra próxima.
 *
 * Cancelamento e afins não desenham as quatro etapas: substituem a
 * apresentação, e é o que `excecao` marca.
 */

function IconePedido() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6.5 3h11v18l-2.7-1.8L12 21l-2.8-1.8L6.5 21V3Z" />
      <path d="M9.5 8h5M9.5 12h5" />
    </svg>
  );
}

function IconePagamento() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2.5" y="5.5" width="19" height="13" rx="2" />
      <path d="M2.5 10h19M6 14.5h3.5" />
    </svg>
  );
}

function IconePreparacao() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3.5 7.8 12 3.5l8.5 4.3v8.4L12 20.5l-8.5-4.3V7.8Z" />
      <path d="M3.5 7.8 12 12l8.5-4.2M12 12v8.5" />
    </svg>
  );
}

function IconeTransporte({ aereo }: { aereo?: boolean }) {
  if (aereo) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 15.5 13.8 12V6.2a1.8 1.8 0 0 0-3.6 0V12L3 15.5v2l7.2-2.1v3.4l-2 1.5v1.2l3.8-1 3.8 1v-1.2l-2-1.5v-3.4L21 17.5v-2Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1.8 6.5h11.4v9.2H1.8z" />
      <path d="M13.2 9.8h3.9l3.1 3v2.9h-7z" />
      <circle cx="6.2" cy="17.8" r="1.9" />
      <circle cx="16.8" cy="17.8" r="1.9" />
    </svg>
  );
}

function IconeEntregue() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3.5 10.5 12 3.8l8.5 6.7v9.3h-17z" />
      <path d="M8.8 13.8l2.3 2.3 4.1-4.3" />
    </svg>
  );
}

function IconeVisto() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4.5 12.8 9.5 18 19.5 6.5" />
    </svg>
  );
}

function iconeDaEtapa(etapa: EtapaPedido, entregue: boolean, aereo: boolean) {
  if (etapa === 1) return <IconePedido />;
  if (etapa === 2) return <IconePagamento />;
  if (etapa === 3) return <IconePreparacao />;
  return entregue ? <IconeEntregue /> : <IconeTransporte aereo={aereo} />;
}

/** Três pontos pulsando — o pedido está a caminho da próxima etapa. */
function PontosPulsantes() {
  return (
    <span className="flex items-center gap-1" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="pulso-etapa h-1 w-1 rounded-full bg-accent"
          style={{ animationDelay: `${i * 180}ms` }}
        />
      ))}
    </span>
  );
}

export function LinhaDoTempo({
  status,
  aereo = false,
}: {
  status: StatusPedido;
  /** Muda o desenho do transporte quando o envio for aéreo. */
  aereo?: boolean;
}) {
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
  const entregue = status.rotulo === "Entregue";

  return (
    <div>
      <ol className="flex items-start">
        {ETAPAS.map(({ etapa, titulo }, i) => {
          const concluida = etapa < atual || (etapa === atual && entregue);
          const ativa = etapa === atual && !entregue;
          const alcancada = concluida || ativa;
          const ultima = i === ETAPAS.length - 1;

          return (
            <li key={etapa} className="flex min-w-0 flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                <div
                  className={`h-px flex-1 ${
                    i === 0 ? "bg-transparent" : alcancada ? "bg-accent" : "bg-white/15"
                  }`}
                />

                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors ${
                    alcancada
                      ? "border-accent bg-accent text-paper"
                      : "border-white/20 text-paper/35"
                  } ${ativa ? "pulso-etapa-aro" : ""}`}
                >
                  <span className={`h-[22px] w-[22px] ${ativa ? "balanco-etapa" : ""}`}>
                    {concluida ? <IconeVisto /> : iconeDaEtapa(etapa, entregue, aereo)}
                  </span>
                </div>

                {/* Entre a etapa atual e a próxima ficam os pontos pulsando. */}
                {!ultima && (
                  <div className="flex flex-1 items-center justify-center">
                    {ativa ? (
                      <PontosPulsantes />
                    ) : (
                      <div className={`h-px w-full ${concluida ? "bg-accent" : "bg-white/15"}`} />
                    )}
                  </div>
                )}
                {ultima && <div className="h-px flex-1 bg-transparent" />}
              </div>

              <div
                className={`mt-3 px-1 text-center text-[11px] font-bold tracking-[0.08em] ${
                  alcancada ? "text-paper" : "text-paper/35"
                }`}
              >
                {titulo.toUpperCase()}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-7 border-l-2 border-accent pl-4">
        <div className="text-sm font-bold tracking-[0.06em]">{status.rotulo}</div>
        <p className="mt-1 text-sm leading-relaxed text-paper/60">{status.descricao}</p>
      </div>
    </div>
  );
}
