import type { Metadata } from "next";

export const metadata: Metadata = { title: "WAB — PIQUE" };

export default function WabPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-paper px-6 text-center text-ink">
      <div className="mb-6 font-accent text-xl italic text-accent">em construção</div>
      <h1 className="font-display text-4xl tracking-tight sm:text-6xl">WAB</h1>
      <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-ink/60">
        Alguma coisa está sendo desenhada. Quando estiver pronta, você vai saber.
      </p>
    </div>
  );
}
