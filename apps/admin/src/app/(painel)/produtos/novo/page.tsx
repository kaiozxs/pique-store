import Link from "next/link";
import { listarCategorias } from "@/lib/produtos";
import { ProdutoForm } from "../ProdutoForm";

export default async function NovoProdutoPage() {
  const categorias = await listarCategorias();
  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/produtos" className="text-sm text-muted hover:text-accent">
        ← Produtos
      </Link>
      <h1 className="mb-6 mt-1 font-display text-2xl uppercase tracking-tight text-ink">Novo produto</h1>
      <ProdutoForm categorias={categorias} produto={null} />
    </div>
  );
}
