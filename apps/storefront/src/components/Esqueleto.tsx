/**
 * Peças de esqueleto para as telas de carregamento.
 *
 * Servem ao problema que o cliente descreveu: ao clicar num link, o navegador
 * ficava parado na página antiga enquanto o servidor montava a próxima — entre
 * 0,4 e 1,2 segundo sem nada mudar na tela. Dava a impressão de que o toque
 * não tinha pego.
 *
 * Com um esqueleto, a troca acontece no instante do clique: a pessoa vê na
 * hora o contorno da página que pediu, e o conteúdo entra por cima. A forma
 * imita o layout real de propósito — esqueleto genérico só troca um tipo de
 * espera por outro.
 */

export function Linha({ w = "100%", h = 14 }: { w?: string; h?: number }) {
  return (
    <div
      aria-hidden="true"
      className="animate-pulse rounded-sm bg-white/[0.07]"
      style={{ width: w, height: h }}
    />
  );
}

export function Bloco({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse bg-white/[0.06] ${className}`} />;
}

export function CardProdutoEsqueleto() {
  return (
    <div className="flex flex-col gap-3">
      <Bloco className="aspect-square w-full" />
      <div className="flex items-center justify-between gap-4">
        <Linha w="60%" />
        <Linha w="22%" />
      </div>
    </div>
  );
}

export function GradeProdutosEsqueleto({ quantos = 8 }: { quantos?: number }) {
  return (
    <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
      {Array.from({ length: quantos }).map((_, i) => (
        <CardProdutoEsqueleto key={i} />
      ))}
    </div>
  );
}

/** Moldura das telas de carregamento: mesma largura e respiro das páginas. */
export function PaginaEsqueleto({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-ink text-paper">
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 sm:py-14">
        {/* Leitor de tela anuncia que está carregando; quem enxerga já vê o
            esqueleto se mexendo. */}
        <span className="sr-only" role="status">
          Carregando…
        </span>
        {children}
      </div>
    </div>
  );
}
