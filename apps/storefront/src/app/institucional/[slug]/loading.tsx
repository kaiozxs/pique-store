import { Linha, PaginaEsqueleto } from "@/components/Esqueleto";

export default function CarregandoInstitucional() {
  return (
    <PaginaEsqueleto>
      <div className="mx-auto max-w-2xl">
        <Linha w="70px" h={12} />
        <div className="mt-4">
          <Linha w="min(380px, 90%)" h={34} />
        </div>
        <div className="mt-8 flex flex-col gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Linha key={i} w={i % 3 === 2 ? "72%" : "100%"} />
          ))}
        </div>
      </div>
    </PaginaEsqueleto>
  );
}
