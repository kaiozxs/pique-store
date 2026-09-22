import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PAGINAS, type BlocoInstitucional, type SecaoInstitucional } from "@/content/institucional";

const SUPPORT_EMAIL = "piquecompanysuporte@gmail.com";

export function generateStaticParams() {
  return Object.keys(PAGINAS).map((slug) => ({ slug }));
}

export async function generateMetadata(props: PageProps<"/institucional/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const pagina = PAGINAS[slug];
  return {
    title: pagina ? `${pagina.title} — PIQUE` : "PIQUE",
    description: pagina?.intro,
  };
}

function Bloco({ bloco }: { bloco: BlocoInstitucional }) {
  if (bloco.tipo === "paragrafo") {
    return <p className="text-[15px] leading-relaxed text-paper/70">{bloco.texto}</p>;
  }

  if (bloco.tipo === "lista") {
    return (
      <ul className="flex flex-col gap-2.5">
        {bloco.itens.map((item) => (
          <li key={item} className="flex gap-3 text-[15px] leading-relaxed text-paper/70">
            <span aria-hidden="true" className="mt-[9px] h-1 w-1 shrink-0 bg-accent" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }

  // A tabela rola sozinha no celular em vez de espremer as colunas ou empurrar
  // a página inteira pro lado.
  return (
    <div className="-mx-6 overflow-x-auto px-6 sm:mx-0 sm:px-0">
      <table className="w-full min-w-[30rem] border-collapse text-left">
        <thead>
          <tr>
            {bloco.colunas.map((coluna) => (
              <th
                key={coluna}
                scope="col"
                className="border-b border-white/20 py-3 pr-5 text-[11px] font-bold tracking-[0.12em] text-paper/60"
              >
                {coluna.toUpperCase()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bloco.linhas.map((linha) => (
            <tr key={linha.join("|")}>
              {linha.map((celula, i) => (
                <td
                  key={i}
                  className={`border-b border-white/10 py-3.5 pr-5 align-top text-sm leading-relaxed ${
                    i === 0 ? "font-semibold text-paper/85" : "text-paper/65"
                  }`}
                >
                  {celula}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Secao({ secao }: { secao: SecaoInstitucional }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-xl tracking-wide text-paper sm:text-2xl">{secao.titulo}</h2>
      {secao.blocos.map((bloco, i) => (
        <Bloco key={i} bloco={bloco} />
      ))}
    </section>
  );
}

export default async function InstitucionalPage(props: PageProps<"/institucional/[slug]">) {
  const { slug } = await props.params;
  const pagina = PAGINAS[slug];
  if (!pagina) notFound();

  const temConteudo = Boolean(pagina.secoes?.length);

  return (
    <div className="bg-ink text-paper">
      <div className="mx-auto min-h-[60vh] max-w-2xl px-6 py-24 sm:px-8">
        <div className="mb-4 text-[13px] font-semibold tracking-[0.28em] text-paper/50">PIQUE</div>
        <h1 className="mb-6 font-display text-3xl tracking-wide sm:text-5xl">{pagina.title.toUpperCase()}</h1>
        <p className="mb-12 text-sm leading-relaxed text-paper/70">{pagina.intro}</p>

        {temConteudo ? (
          <>
            <div className="flex flex-col gap-11">
              {pagina.secoes!.map((secao) => (
                <Secao key={secao.titulo} secao={secao} />
              ))}
            </div>

            {pagina.baseLegal && (
              <div className="mt-14 border-t border-white/15 pt-7">
                <div className="mb-2 text-[11px] font-bold tracking-[0.14em] text-paper/50">
                  BASE LEGAL DE REFERÊNCIA
                </div>
                <p className="text-[13px] leading-relaxed text-paper/50">{pagina.baseLegal}</p>
              </div>
            )}

            <div className="mt-8 text-[13px] leading-relaxed text-paper/50">
              Dúvida sobre esta política? Fala com a gente em{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="font-semibold text-paper/80 underline underline-offset-4 hover:text-accent"
              >
                {SUPPORT_EMAIL}
              </a>
              .
            </div>
          </>
        ) : (
          <div className="border border-white/15 p-6">
            <div className="mb-2 text-[12px] font-bold tracking-[0.14em] text-accent">EM CONSTRUÇÃO</div>
            <p className="text-sm leading-relaxed text-paper/60">
              Essa página ainda está sendo escrita. Enquanto isso, se precisar dessa informação agora, fala
              com a gente em{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="font-semibold text-paper underline underline-offset-4 hover:text-accent"
              >
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
          </div>
        )}

        <Link
          href="/"
          className="mt-12 inline-block border border-accent bg-accent px-8 py-4 text-[13px] font-bold tracking-[0.14em] transition-colors hover:bg-paper hover:text-ink"
        >
          VOLTAR À LOJA
        </Link>
      </div>
    </div>
  );
}
