import Image from "next/image";
import Link from "next/link";
import { getBookContent } from "@/lib/medusa";

export async function BookTeaser() {
  const book = await getBookContent();
  const revelado = book.status === "revelado";

  return (
    <section id="book" className="bordas-suaves relative isolate overflow-hidden bg-ink text-paper">
      {/* Banner de largura cheia: a foto tem o fundo escuro justamente do lado
          esquerdo, que é onde o texto cai — dá pra escurecer de leve em vez de
          jogar um véu pesado por cima do rosto. No celular a rampa vira
          vertical, senão ela apagaria a foto inteira. */}
      <Image
        src="/images/wab-modelo.jpg"
        alt=""
        fill
        className="object-cover object-[68%_center] sm:object-[62%_center]"
        sizes="100vw"
      />
      {/* Gradientes escritos à mão em vez das classes from-/via-/to- do Tailwind:
          elas interpolam em oklab, e nessa faixa quase preta a conversão gera
          degraus visíveis (aquelas faixas verticais no escuro). Em sRGB o
          degradê é liso.

          As paradas são explícitas de propósito: preto chapado só até onde o
          texto chega, o esfumado acontece no miolo, e do meio pra direita a
          foto fica limpa. */}
      <div className="absolute inset-0 hidden bg-[linear-gradient(to_right,#0b0b0c_0%,#0b0b0c_28%,rgba(11,11,12,0.55)_48%,rgba(11,11,12,0)_72%)] sm:block" />
      <div className="absolute inset-0 bg-[linear-gradient(to_top,#0b0b0c_0%,rgba(11,11,12,0.6)_50%,rgba(11,11,12,0.2)_100%)] sm:bg-[linear-gradient(to_top,#0b0b0c_0%,rgba(11,11,12,0.15)_50%,rgba(11,11,12,0)_100%)]" />

      {/* Grão quase imperceptível por cima de tudo. Mesmo em sRGB, tom escuro
          espalhado por centenas de pixels ainda cria faixa; o ruído embaralha a
          fronteira entre um tom e o seguinte e ela some. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[url(/images/noise.png)] opacity-[0.045] mix-blend-overlay"
      />

      <div className="relative mx-auto max-w-7xl px-6 py-20 sm:px-8 sm:py-24 lg:py-28">
        <div className="mb-5 font-accent text-xl italic text-accent">
          {revelado ? "revelado" : "em construção"}
        </div>
        {/* A logo é a assinatura da linha — o <h2> continua existindo pra
            leitor de tela e pro SEO, só que visualmente quem fala é a marca. */}
        {/* A logo entra dimensionada pela ALTURA, não pela largura: assim ela
            fica na mesma escala do título de texto que aparece quando a linha
            é revelada, e a troca de um pelo outro não muda o ritmo da seção. */}
        <h2 className="font-display text-4xl tracking-wide sm:text-6xl">
          {revelado && book.title ? (
            book.title
          ) : (
            <>
              <span className="sr-only">WAB</span>
              <Image
                src="/images/wab-logo.png"
                alt=""
                width={338}
                height={172}
                priority
                className="h-[44px] w-auto sm:h-[58px] lg:h-[68px]"
              />
            </>
          )}
        </h2>
        <p className="mt-7 max-w-md text-sm leading-relaxed text-paper/70">
          {revelado && book.body
            ? book.body
            : "Alguma coisa está sendo desenhada. Quando estiver pronta, você vai saber."}
        </p>
        <Link
          href="/book"
          className="group mt-9 inline-flex items-center gap-2.5 text-[13px] font-bold tracking-[0.14em]"
        >
          <span className="transition-colors duration-300 ease-out group-hover:text-accent">
            CONHECER A WAB
          </span>
          <span
            aria-hidden="true"
            className="text-accent transition-transform duration-300 ease-out group-hover:translate-x-1.5"
          >
            →
          </span>
        </Link>
      </div>
    </section>
  );
}
