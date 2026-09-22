import Image from "next/image";
import Link from "next/link";
import { getBookContent } from "@/lib/medusa";

export async function BookTeaser() {
  const book = await getBookContent();
  const revelado = book.status === "revelado";

  return (
    <section id="book" className="bg-ink text-paper">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-20 sm:px-8 sm:py-28 lg:grid-cols-2 lg:gap-16">
        <div>
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
                  width={200}
                  height={109}
                  className="h-auto w-[150px] sm:w-[200px]"
                />
              </>
            )}
          </h2>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-paper/60">
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

        <div className="relative aspect-[16/11] w-full overflow-hidden lg:aspect-[16/12]">
          <Image
            src="/images/wab-modelo.jpg"
            alt="Modelo usando os óculos WAB"
            fill
            className="object-cover object-[62%_center]"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
        </div>
      </div>
    </section>
  );
}
