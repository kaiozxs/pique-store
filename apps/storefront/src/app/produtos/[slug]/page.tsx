import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PRODUTOS, getProduto } from "@/lib/sample-data";
import { ProductDetail } from "@/components/product/ProductDetail";

export function generateStaticParams() {
  return PRODUTOS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/produtos/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const produto = getProduto(slug);
  return { title: produto ? `${produto.nome} — PIQUE` : "Produto — PIQUE" };
}

export default async function ProdutoPage(props: PageProps<"/produtos/[slug]">) {
  const { slug } = await props.params;
  const produto = getProduto(slug);

  if (!produto) {
    notFound();
  }

  return (
    <div className="bg-ink text-paper">
      <ProductDetail produto={produto} />
    </div>
  );
}
