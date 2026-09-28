import { Bloco, Linha, PaginaEsqueleto } from "@/components/Esqueleto";

export default function CarregandoProduto() {
  return (
    <PaginaEsqueleto>
      <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-20">
        <Bloco className="aspect-square w-full" />
        <div className="flex flex-col gap-5 pt-2">
          <Linha w="70%" h={34} />
          <Linha w="35%" h={22} />
          <div className="mt-2 flex flex-col gap-3">
            <Linha w="45%" h={12} />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Bloco key={i} className="h-11 w-14" />
              ))}
            </div>
          </div>
          <Bloco className="mt-4 h-14 w-full max-w-sm" />
          <div className="mt-3 flex flex-col gap-2">
            <Linha />
            <Linha w="90%" />
            <Linha w="75%" />
          </div>
        </div>
      </div>
    </PaginaEsqueleto>
  );
}
