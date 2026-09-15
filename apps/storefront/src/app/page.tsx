import { Hero } from "@/components/home/Hero";
import { Collections } from "@/components/home/Collections";
import { DropDaSemana } from "@/components/home/DropDaSemana";
import { BookTeaser } from "@/components/home/BookTeaser";
import { DicasDestaque } from "@/components/home/DicasDestaque";
import { Apresentacao } from "@/components/home/Apresentacao";
import { getHomeSections, type HomeSectionType } from "@/lib/medusa";

export default async function Home() {
  const sections = await getHomeSections();

  return (
    <>
      {sections.map((section) => {
        switch (section.type as HomeSectionType) {
          case "hero":
            return (
              <div key={section.type}>
                <Hero config={section.config} />
                <Collections />
              </div>
            );
          case "drop_destaque":
            return <DropDaSemana key={section.type} />;
          case "wab_teaser":
            return <BookTeaser key={section.type} />;
          case "dicas_destaque":
            return <DicasDestaque key={section.type} />;
          case "apresentacao":
            return <Apresentacao key={section.type} config={section.config} />;
          default:
            return null;
        }
      })}
    </>
  );
}
