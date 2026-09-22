import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

// Uma rota só pra todas as páginas institucionais/legais em vez de um arquivo
// por página: o conteúdo de verdade ainda vai ser escrito (as políticas têm
// peso legal e precisam vir do dono da loja), e enquanto isso nenhum link do
// rodapé cai em erro 404.
const PAGES: Record<string, { title: string; intro: string }> = {
  sobre: {
    title: "Sobre a PIQUE",
    intro: "A história da marca, o propósito e quem está por trás das peças.",
  },
  "guia-de-tamanhos": {
    title: "Guia de tamanhos",
    intro: "Tabela de medidas de cada peça pra você escolher entre P, M, G e GG sem errar.",
  },
  "trocas-e-devolucoes": {
    title: "Trocas e devoluções",
    intro: "Como pedir troca ou devolução, prazos e condições.",
  },
  "entrega-e-frete": {
    title: "Entrega e frete",
    intro: "Prazos, valores e como acompanhar seu pedido.",
  },
  criadores: {
    title: "Criadores de conteúdo",
    intro: "Como criar conteúdo com a PIQUE e fazer parte da comunidade.",
  },
  "politica-de-privacidade": {
    title: "Política de privacidade",
    intro: "Quais dados a gente coleta, por que, e o que você pode pedir sobre eles.",
  },
  "termos-de-uso": {
    title: "Termos de uso",
    intro: "As regras de uso do site e das compras feitas por aqui.",
  },
  "politica-de-cookies": {
    title: "Política de cookies",
    intro: "Quais cookies o site usa e pra quê.",
  },
  "politica-de-envio": {
    title: "Política de envio",
    intro: "Como os pedidos são separados, embalados e despachados.",
  },
  "informacoes-legais": {
    title: "Informações legais da empresa",
    intro: "Razão social, CNPJ e endereço da empresa responsável pela loja.",
  },
  "trabalhe-conosco": {
    title: "Trabalhe conosco",
    intro: "Vagas abertas e como mandar seu currículo.",
  },
  "seja-parceiro": {
    title: "Seja parceiro",
    intro: "Parcerias comerciais, colabs e projetos em conjunto.",
  },
  patrocinio: {
    title: "Patrocínio",
    intro: "Propostas de patrocínio de atletas, artistas e eventos.",
  },
  fornecedores: {
    title: "Fornecedores",
    intro: "Como se tornar fornecedor da PIQUE.",
  },
  imprensa: {
    title: "Imprensa",
    intro: "Materiais de imprensa e contato para pauta.",
  },
};

export function generateStaticParams() {
  return Object.keys(PAGES).map((slug) => ({ slug }));
}

export async function generateMetadata(props: PageProps<"/institucional/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const page = PAGES[slug];
  return { title: page ? `${page.title} — PIQUE` : "PIQUE" };
}

export default async function InstitucionalPage(props: PageProps<"/institucional/[slug]">) {
  const { slug } = await props.params;
  const page = PAGES[slug];
  if (!page) notFound();

  return (
    <div className="bg-ink text-paper">
      <div className="mx-auto min-h-[60vh] max-w-2xl px-6 py-24 sm:px-8">
        <div className="mb-4 text-[13px] font-semibold tracking-[0.28em] text-paper/50">PIQUE</div>
        <h1 className="mb-6 font-display text-3xl tracking-wide sm:text-5xl">{page.title.toUpperCase()}</h1>
        <p className="mb-10 text-sm leading-relaxed text-paper/70">{page.intro}</p>

        <div className="border border-white/15 p-6">
          <div className="mb-2 text-[12px] font-bold tracking-[0.14em] text-accent">EM CONSTRUÇÃO</div>
          <p className="text-sm leading-relaxed text-paper/60">
            Essa página ainda está sendo escrita. Enquanto isso, se precisar dessa informação agora, fala
            com a gente em{" "}
            <a
              href="mailto:piquecompanysuporte@gmail.com"
              className="font-semibold text-paper underline underline-offset-4 hover:text-accent"
            >
              piquecompanysuporte@gmail.com
            </a>
            .
          </p>
        </div>

        <Link
          href="/"
          className="mt-10 inline-block border border-accent bg-accent px-8 py-4 text-[13px] font-bold tracking-[0.14em] transition-colors hover:bg-paper hover:text-ink"
        >
          VOLTAR À LOJA
        </Link>
      </div>
    </div>
  );
}
