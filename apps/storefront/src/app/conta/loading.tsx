import { Bloco, Linha, PaginaEsqueleto } from "@/components/Esqueleto";

export default function CarregandoConta() {
  return (
    <PaginaEsqueleto>
      <div className="mx-auto max-w-5xl">
        <Linha w="90px" h={12} />
        <div className="mt-3">
          <Linha w="260px" h={30} />
        </div>
        <div className="mt-8 flex gap-2 border-y border-white/10 py-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Bloco key={i} className="h-8 w-28" />
          ))}
        </div>
        <div className="mt-9 flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Bloco key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    </PaginaEsqueleto>
  );
}
