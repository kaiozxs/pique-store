import { Marquee } from "@/components/home/Marquee";
import { Hero } from "@/components/home/Hero";
import { DropDaSemana } from "@/components/home/DropDaSemana";
import { WabTeaser } from "@/components/home/WabTeaser";
import { DicasDestaque } from "@/components/home/DicasDestaque";
import { Apresentacao } from "@/components/home/Apresentacao";

export default function Home() {
  return (
    <>
      <Marquee />
      <Hero />
      <DropDaSemana />
      <WabTeaser />
      <DicasDestaque />
      <Apresentacao />
    </>
  );
}
