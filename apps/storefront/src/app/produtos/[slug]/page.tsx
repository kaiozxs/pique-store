import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductByHandle, listProducts } from "@/lib/medusa";
import { ProductDetail } from "@/components/product/ProductDetail";

export async function generateStaticParams() {
  const { products } = await listProducts();
  return products.map((p) => ({ slug: p.handle }));
}

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
