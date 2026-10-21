import Link from "next/link";
import { notFound } from "next/navigation";
import { buscarProduto, listarCategorias } from "@/lib/produtos";
import { ProdutoForm } from "../ProdutoForm";

export default async function EditarProdutoPage({ params }: PageProps<"/produtos/[id]">) {
  const { id } = await params;
  const [produto, categorias] = await Promise.all([buscarProduto(id), listarCategorias()]);
  if (!produto) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/produtos" className="text-sm text-muted hover:text-accent">
        ← Produtos
      </Link>
      <h1 className="mb-6 mt-1 font-display text-2xl uppercase tracking-tight text-ink">{produto.title}</h1>
      <ProdutoForm categorias={categorias} produto={produto} />
    </div>
  );
}
