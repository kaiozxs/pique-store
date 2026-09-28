import { Bloco, Linha, PaginaEsqueleto } from "@/components/Esqueleto";

export default function CarregandoSacola() {
  return (
    <PaginaEsqueleto>
      <Linha w="200px" h={30} />
      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div className="flex flex-col gap-5">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Bloco className="h-24 w-20 shrink-0" />
              <div className="flex flex-1 flex-col gap-2 pt-1">
                <Linha w="55%" />
                <Linha w="30%" h={12} />
              </div>
            </div>
          ))}
        </div>
        <Bloco className="h-52 w-full" />
      </div>
    </PaginaEsqueleto>
  );
}
