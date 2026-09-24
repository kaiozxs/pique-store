import { Hero } from "@/components/home/Hero";
import { Collections } from "@/components/home/Collections";
import { DropDaSemana } from "@/components/home/DropDaSemana";
import { BookTeaser } from "@/components/home/BookTeaser";
import { getHomeSections, type HomeSectionType } from "@/lib/medusa";

export default async function Home() {
  const sections = await getHomeSections();
  const ativa = new Set(sections.map((s) => s.type as HomeSectionType));
  const config = (tipo: HomeSectionType) => sections.find((s) => s.type === tipo)?.config;

  // A sequência da landing é decisão de desenho e fica aqui, escrita na ordem
  // em que a página aparece: abertura → o que está à venda agora → as
  // coleções → a WAB. O painel continua mandando no conteúdo de cada seção e
  // em ligar ou desligar cada uma; só não decide mais a ordem.
  //
  // O antigo bloco de manifesto saiu da home — aquele texto agora vive na
  // página Sobre a PIQUE, que é pra onde o botão da abertura leva.
  return (
    <>
      {ativa.has("hero") && <Hero config={config("hero")} />}
      {ativa.has("drop_destaque") && <DropDaSemana />}
      <Collections />
      {ativa.has("wab_teaser") && <BookTeaser />}
    </>
  );
}
