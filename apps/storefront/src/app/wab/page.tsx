import type { Metadata } from "next";
import { getWabContent } from "@/lib/medusa";

export const metadata: Metadata = { title: "WAB — PIQUE" };

export default async function WabPage() {
  const wab = await getWabContent();
  const revelado = wab.status === "revelado";

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-paper px-6 text-center text-ink">
      <div className="mb-6 font-accent text-xl italic text-accent">
        {revelado ? "revelado" : "em construção"}
      </div>
      <h1 className="font-display text-4xl tracking-wide sm:text-6xl">
        {revelado && wab.title ? wab.title : "WAB"}
      </h1>
      <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-ink/60">
        {revelado && wab.body ? wab.body : "Alguma coisa está sendo desenhada. Quando estiver pronta, você vai saber."}
      </p>
      {revelado && wab.media?.items?.length ? (
        <div className="mt-10 grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
          {wab.media.items.map((item) =>
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
