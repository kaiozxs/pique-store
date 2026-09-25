import type { Metadata } from "next";
import Image from "next/image";
import { getBookContent } from "@/lib/medusa";

export const metadata: Metadata = { title: "WAB — PIQUE" };

export default async function BookPage() {
  const book = await getBookContent();
  const revelado = book.status === "revelado";

  return (
    <div className="bg-ink text-paper">
      {/* Banner da linha: a foto do modelo tem o fundo escuro do lado esquerdo,
          então o texto cai justamente na parte vazia da imagem — sem véu pesado
          por cima do rosto. */}
      <section className="bordas-suaves relative isolate overflow-hidden">
        <Image
          src="/images/wab-modelo.jpg"
          alt=""
          fill
          priority
          className="object-cover object-[70%_center]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0b0b0c_0%,#0b0b0c_26%,rgba(11,11,12,0.6)_50%,rgba(11,11,12,0.1)_78%)]" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[url(/images/noise.png)] opacity-[0.045] mix-blend-overlay"
        />

        <div className="relative mx-auto max-w-7xl px-6 py-20 sm:px-8 sm:py-24 lg:py-28">
          <div className="mb-5 font-accent text-xl italic text-accent">
            {revelado ? "revelado" : "em construção"}
          </div>
          <h1 className="font-display text-4xl tracking-wide sm:text-6xl">
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
                  className="h-[48px] w-auto sm:h-[64px] lg:h-[76px]"
                />
              </>
            )}
          </h1>
          <p className="mt-7 max-w-md text-sm leading-relaxed text-paper/70">
            {revelado && book.body
              ? book.body
              : "Alguma coisa está sendo desenhada. Quando estiver pronta, você vai saber."}
          </p>
        </div>
      </section>

      {revelado && book.media?.items?.length ? (
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-4 px-6 py-16 sm:grid-cols-2">
          {book.media.items.map((item) =>
            item.type === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={item.url} src={item.url} alt="" className="w-full object-cover" />
            ) : (
              <video key={item.url} src={item.url} controls className="w-full" />
            )
          )}
        </div>
      ) : null}
    </div>
  );
}
