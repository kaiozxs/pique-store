import Image from "next/image";
import Link from "next/link";
import type { PieceVerification } from "@/lib/medusa";
import { sizeLabel } from "@/lib/tamanhos";
import { CopiarId } from "@/components/conta/CopiarId";

function dataCurta(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

/**
 * Certificado da peça: foto à esquerda, ficha à direita. A ideia é parecer
 * um documento de autenticidade — selo, código e a quem a peça pertence —,
 * e não só uma frase de "deu certo".
 */
export function ResultadoVerificacao({ result }: { result: PieceVerification }) {
  if (!result.valid) {
    const revogado = result.status === "revogado";
    return (
      <div className="hero-sobe mt-10 flex items-start gap-4 border border-accent/40 bg-accent/[0.06] p-6">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true" className="mt-0.5 shrink-0 text-accent">
          <circle cx="12" cy="12" r="9" />
          <path d="M9 9l6 6M15 9l-6 6" />
        </svg>
        <div>
          <div className="font-display text-xl tracking-wide">{revogado ? "CÓDIGO REVOGADO" : "CÓDIGO NÃO ENCONTRADO"}</div>
          <p className="mt-2 text-sm leading-relaxed text-paper/65">
            {revogado
              ? "Este código foi cancelado e não comprova mais a autenticidade de uma peça."
              : "Confira se digitou o código exatamente como está na etiqueta. Se a peça não tem código, ela pode não ser original."}
          </p>
        </div>
      </div>
    );
  }

  const p = result.product;
  const registrada = Boolean(result.owner_id) || result.status === "registrado";
  const variante = p?.variant_title
    ? p.variant_title
        .split(/\s*\/\s*/)
        .map((v) => sizeLabel(v))
        .join(" · ")
    : null;

  return (
    <div className="hero-sobe mt-10 grid overflow-hidden border border-white/15 sm:grid-cols-[minmax(0,240px)_1fr]">
      {/* Foto da peça */}
      <div className="relative aspect-square bg-product sm:aspect-auto sm:min-h-[280px]">
        {p?.thumbnail ? (
          <Image src={p.thumbnail} alt={p.title ?? "Peça PIQUE"} fill sizes="(min-width: 640px) 240px, 100vw" className="object-contain p-4" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center font-display text-3xl tracking-wide text-paper/30">PIQUE</div>
        )}
        <span className="absolute left-3 top-3 bg-accent px-2.5 py-1 text-[10px] font-bold tracking-[0.18em] text-paper">ORIGINAL</span>
      </div>

      {/* Ficha */}
      <div className="flex flex-col gap-5 p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0 text-accent">
            <path d="M12 3l7 3v5c0 4.4-3 8-7 10-4-2-7-5.6-7-10V6l7-3Z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
          <div>
            <div className="text-[11px] font-semibold tracking-[0.28em] text-accent">PEÇA AUTÊNTICA</div>
            <div className="font-display text-2xl leading-tight tracking-wide sm:text-3xl">{(p?.title ?? "Peça PIQUE").toUpperCase()}</div>
          </div>
        </div>

        <dl className="grid gap-x-8 gap-y-4 border-t border-white/10 pt-5 text-sm sm:grid-cols-2">
          {variante && (
            <div>
              <dt className="text-[11px] font-semibold tracking-[0.18em] text-paper/45">VARIAÇÃO</dt>
              <dd className="mt-1 text-paper/85">{variante}</dd>
            </div>
          )}
          {result.code && (
            <div>
              <dt className="text-[11px] font-semibold tracking-[0.18em] text-paper/45">CÓDIGO DA PEÇA</dt>
              <dd className="mt-1 font-semibold tracking-[0.12em] text-paper/85">{result.code}</dd>
            </div>
          )}
          <div>
            <dt className="text-[11px] font-semibold tracking-[0.18em] text-paper/45">
              {registrada ? "COMPRADA POR" : "DONO"}
            </dt>
            <dd className="mt-1 flex items-center gap-1 text-paper/85">
              {result.owner_id ? (
                <>
                  <span className="font-semibold tracking-[0.12em]">{result.owner_id}</span>
                  <CopiarId id={result.owner_id} />
                </>
              ) : registrada ? (
                <span>Registrada em nome de um cliente</span>
              ) : (
                <span className="text-paper/60">Ainda não registrada em nome de ninguém</span>
              )}
            </dd>
          </div>
          {result.purchased_at && (
            <div>
              <dt className="text-[11px] font-semibold tracking-[0.18em] text-paper/45">COMPRA REALIZADA EM</dt>
              <dd className="mt-1 text-paper/85">{dataCurta(result.purchased_at)}</dd>
            </div>
          )}
        </dl>

        {p?.handle && (
          <Link
            href={`/produtos/${p.handle}`}
            className="group mt-auto inline-flex w-fit items-center gap-2.5 text-[12px] font-bold tracking-[0.14em]"
          >
            <span className="transition-colors group-hover:text-accent">VER A PEÇA NA LOJA</span>
            <span aria-hidden="true" className="text-accent transition-transform group-hover:translate-x-1.5">
              →
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}
