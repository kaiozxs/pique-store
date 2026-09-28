import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentCustomer, listFavorites } from "@/lib/customer";
import { listProductsByHandles } from "@/lib/medusa";
import { FavoritoCard } from "./FavoritoCard";
import { ContaShell, ContaVazio } from "@/components/conta/ContaShell";

export const metadata: Metadata = { title: "Favoritos — PIQUE" };

export default async function FavoritosPage() {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/conta");

  const handles = await listFavorites();
  const { products, region } = await listProductsByHandles(handles);

  return (
    <ContaShell titulo="Favoritos" descricao="As peças que você salvou.">
      {products.length === 0 ? (
        <ContaVazio
          texto="Você ainda não salvou nenhuma peça. O coração fica na página do produto."
          botao={{ href: "/drops", label: "VER O CATÁLOGO" }}
        />
      ) : (
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-3">
          {products.map((product) => (
            <FavoritoCard key={product.id} product={product} region={region} />
          ))}
        </div>
      )}
    </ContaShell>
  );
}
