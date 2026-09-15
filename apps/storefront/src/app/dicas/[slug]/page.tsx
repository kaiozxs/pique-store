import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTipBySlug } from "@/lib/medusa";

export async function generateMetadata(props: PageProps<"/dicas/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const tip = await getTipBySlug(slug);
  return { title: tip ? `${tip.title} — PIQUE` : "Dica — PIQUE" };
}

export default async function DicaPage(props: PageProps<"/dicas/[slug]">) {
  const { slug } = await props.params;
  const tip = await getTipBySlug(slug);

  if (!tip) {
    notFound();
  }

  return (
    <div className="bg-ink text-paper">
      <article className="mx-auto max-w-3xl px-6 py-20 sm:px-8">
        <div className="mb-6 aspect-video border border-dashed border-white/20 bg-[#161617]" />
        <h1 className="font-display text-3xl tracking-wide sm:text-4xl">{tip.title}</h1>
        <p className="mt-6 whitespace-pre-line text-base leading-relaxed text-paper/70">{tip.body}</p>
      </article>
    </div>
  );
}
