import Link from "next/link";
import { listarProdutos } from "@/lib/produtos";
import { formatMoney } from "@/lib/orders";

export default async function ProdutosPage({ searchParams }: PageProps<"/produtos">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const produtos = await listarProdutos(q);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl uppercase tracking-tight text-ink">Produtos</h1>
        <div className="flex items-center gap-3">
          <form className="flex items-center gap-2">
            <input
              name="q"
              defaultValue={q}
              placeholder="Buscar produto"
              className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            />
          </form>
          <Link href="/produtos/novo" className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
            Novo produto
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg text-left text-xs font-semibold uppercase tracking-wide text-muted">
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Situação</th>
              <th className="px-4 py-3">Variações</th>
              <th className="px-4 py-3">Preço</th>
              <th className="px-4 py-3 text-right">Estoque</th>
            </tr>
          </thead>
          <tbody>
            {produtos.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted">
                  {q ? "Nenhum produto com esse nome." : "Nenhum produto ainda."}
                </td>
              </tr>
            )}
            {produtos.map((p) => {
              const ativas = p.variants.filter((v) => v.active);
              const precos = ativas.map((v) => v.price);
              const menor = precos.length ? Math.min(...precos) : null;
              const maior = precos.length ? Math.max(...precos) : null;
              const estoque = ativas.reduce((n, v) => n + v.stock, 0);
              const semEstoque = ativas.length > 0 && ativas.every((v) => v.stock === 0 && !v.allow_backorder);
              return (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-bg">
                  <td className="px-4 py-3">
                    <Link href={`/produtos/${p.id}`} className="flex items-center gap-3 font-semibold text-ink hover:text-accent">
                      {p.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.thumbnail} alt="" className="h-12 w-10 shrink-0 rounded bg-bg object-cover" />
                      ) : (
                        <span className="h-12 w-10 shrink-0 rounded bg-bg" />
                      )}
                      <span>{p.title}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        p.status === "published" ? "bg-success/15 text-success" : "bg-white/10 text-muted"
                      }`}
                    >
                      {p.status === "published" ? "Na loja" : "Rascunho"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">{ativas.length}</td>
                  <td className="px-4 py-3 text-ink">
                    {menor === null ? "—" : menor === maior ? formatMoney(menor, "brl") : `${formatMoney(menor, "brl")} – ${formatMoney(maior!, "brl")}`}
                  </td>
                  <td className={`px-4 py-3 text-right font-semibold ${semEstoque ? "text-danger" : "text-ink"}`}>
                    {semEstoque ? "Esgotado" : estoque}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
