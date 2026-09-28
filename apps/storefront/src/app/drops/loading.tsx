import { GradeProdutosEsqueleto, Linha, PaginaEsqueleto } from "@/components/Esqueleto";

export default function CarregandoDrops() {
  return (
    <PaginaEsqueleto>
      <div className="mb-7 flex flex-wrap items-baseline justify-between gap-4">
        <Linha w="220px" h={30} />
        <Linha w="120px" h={12} />
      </div>
      <div className="mb-9 flex flex-col gap-4 border-y border-white/10 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Linha w="min(360px, 100%)" h={42} />
        <Linha w="180px" h={34} />
      </div>
      <GradeProdutosEsqueleto />
    </PaginaEsqueleto>
  );
}
