import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductByHandle } from "@/lib/medusa";
import { ProductDetail } from "@/components/product/ProductDetail";

// Sem generateStaticParams de propósito: isso obrigaria o build a bater no
// backend pra pré-gerar cada página de produto — quebra o build da Vercel
// se o backend não estiver no ar (ou mudar de endereço) naquele momento.
// A página já renderiza dinamicamente por requisição, então funciona igual.

export async function generateMetadata(props: PageProps<"/produtos/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const { product } = await getProductByHandle(slug);
  return { title: product ? `${product.title} — PIQUE` : "Produto — PIQUE" };
}

export default async function ProdutoPage(props: PageProps<"/produtos/[slug]">) {
  const { slug } = await props.params;
  const { product, region } = await getProductByHandle(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="bg-ink text-paper">
      <ProductDetail product={product} region={region} />
    </div>
  );
}
