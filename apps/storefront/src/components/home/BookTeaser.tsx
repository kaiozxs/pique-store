import Image from "next/image";
import Link from "next/link";
import { getBookContent } from "@/lib/medusa";

export async function BookTeaser() {
  const book = await getBookContent();
  const revelado = book.status === "revelado";

  return (
    <section id="book" className="relative isolate overflow-hidden bg-ink text-paper">
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
      {/* As paradas são explícitas de propósito: preto chapado só até onde o
          texto chega, o esfumado acontece no miolo, e do meio pra direita a
          foto fica limpa. Sem isso o gradiente padrão do Tailwind (0/50/100%)
          escurece o rosto junto. */}
      <div className="absolute inset-0 hidden bg-gradient-to-r from-ink from-28% via-ink/55 via-48% to-transparent to-72% sm:block" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/20 sm:via-ink/15 sm:to-transparent" />

      <div className="relative mx-auto max-w-7xl px-6 py-24 sm:px-8 sm:py-36">
        <div className="mb-6 font-accent text-xl italic text-accent">
          {revelado ? "revelado" : "em construção"}
        </div>
        {/* A logo é a assinatura da linha — o <h2> continua existindo pra
            leitor de tela e pro SEO, só que visualmente quem fala é a marca. */}
        <h2 className="font-display text-4xl tracking-wide sm:text-6xl">
          {revelado && book.title ? (
            book.title
          ) : (
            <>
              <span className="sr-only">WAB</span>
              <Image
                src="/images/wab-logo.png"
                alt=""
                width={240}
                height={131}
                className="h-auto w-[160px] sm:w-[240px]"
              />
            </>
          )}
        </h2>
        <p className="mt-6 max-w-md text-sm leading-relaxed text-paper/70">
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
