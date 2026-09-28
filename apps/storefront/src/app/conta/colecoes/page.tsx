import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentCustomer, listMyPieces } from "@/lib/customer";
import { variantTitleLabel } from "@/lib/tamanhos";
import { ContaShell, ContaVazio } from "@/components/conta/ContaShell";

export const metadata: Metadata = { title: "Minhas coleções — PIQUE" };

// Cada peça tem um estado próprio, independente do pedido: é o registro dela
// que diz se está ativa, em transferência ou marcada como perdida.
const ROTULO_STATUS: Record<string, { texto: string; destaque: boolean }> = {
  ativo: { texto: "ATIVA", destaque: false },
  pendente: { texto: "AGUARDANDO ATIVAÇÃO", destaque: false },
  em_transferencia: { texto: "EM TRANSFERÊNCIA", destaque: true },
  revogado: { texto: "REGISTRO REVOGADO", destaque: true },
};

export default async function ColecoesPage() {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/conta");

  const pecas = await listMyPieces();

  return (
    <ContaShell
      titulo="Minhas coleções"
      descricao="As peças PIQUE registradas no seu nome. Cada uma tem um código único e pode ser transferida para outra conta."
    >
      {pecas.length === 0 ? (
        <ContaVazio
          texto="Nenhuma peça registrada ainda. Depois de comprar, a peça aparece aqui com o código dela."
          botao={{ href: "/drops", label: "VER O CATÁLOGO" }}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {pecas.map((peca) => {
            const status = ROTULO_STATUS[peca.status] ?? { texto: peca.status.toUpperCase(), destaque: false };
            return (
              <div key={peca.id} className="flex flex-wrap items-center gap-5 border border-white/12 p-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden bg-product">
                  {peca.product?.thumbnail ? (
                    <Image src={peca.product.thumbnail} alt="" fill className="object-contain" sizes="80px" />
                  ) : null}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{peca.product?.title ?? "Peça PIQUE"}</div>
                  {peca.product?.variant_title && (
                    <div className="mt-0.5 text-sm text-paper/55">
                      {variantTitleLabel(peca.product.variant_title)}
                    </div>
                  )}
                  <div className="mt-1.5 font-mono text-xs tracking-wide text-paper/45">
                    {peca.unique_code}
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span
                    className={`border px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] ${
                      status.destaque ? "border-accent text-accent" : "border-white/20 text-paper/60"
                    }`}
                  >
                    {status.texto}
                  </span>
                  <Link
                    href={`/verifique?codigo=${encodeURIComponent(peca.unique_code)}`}
                    className="text-[12px] font-semibold tracking-[0.06em] text-paper/55 transition-colors hover:text-accent"
                  >
                    VERIFICAR / TRANSFERIR
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </ContaShell>
  );
}
