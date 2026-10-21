import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { podeAcessar } from "@/lib/papel";
import { formatMoney } from "@/lib/orders";
import { idPessoal, listVendas, nomeDoCliente } from "@/lib/vendas";
import { DateRangeCalendar } from "@/components/DateRangeCalendar";

// Dia de hoje no fuso de São Paulo (o servidor pode estar em UTC).
function hoje(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
}
function diasAtras(n: number): string {
  const d = new Date(`${hoje()}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}
function dataBR(key: string): string {
  const [a, m, d] = key.split("-");
  return `${d}/${m}/${a}`;
}

export default async function VendasPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await getCurrentUser();
  if (!user || !podeAcessar(user.papel, "/vendas")) redirect("/pedidos");

  const params = await searchParams;
  const valido = (v?: string) => (v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : undefined);
  const inicio = valido(params.start) ?? diasAtras(6);
  const fim = valido(params.end) ?? hoje();

  const vendas = await listVendas(inicio, fim);
  const pecas = vendas.reduce((n, v) => n + (v.items ?? []).reduce((m, i) => m + Number(i.quantity ?? 0), 0), 0);
  const moeda = vendas[0]?.currency_code ?? "brl";
  const total = vendas.reduce((n, v) => n + Number(v.total ?? 0), 0);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl uppercase tracking-tight text-ink">Vendas e etiquetas</h1>
          <p className="mt-1 text-sm text-muted">
            {dataBR(inicio)} — {dataBR(fim)}
          </p>
        </div>
        <DateRangeCalendar initialStart={inicio} initialEnd={fim} basePath="/vendas" />
      </div>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-surface p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted">Vendas</div>
          <div className="mt-2 text-2xl font-bold text-ink">{vendas.length}</div>
        </div>
        <div className="rounded-lg border border-border bg-surface p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted">Peças vendidas</div>
          <div className="mt-2 text-2xl font-bold text-ink">{pecas}</div>
        </div>
        <div className="rounded-lg border border-border bg-surface p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted">Faturamento</div>
          <div className="mt-2 text-2xl font-bold text-ink">{formatMoney(total, moeda)}</div>
        </div>
      </div>

      <div className="mb-6 overflow-x-auto rounded-lg border border-border bg-surface">
        {vendas.length === 0 ? (
          <p className="p-6 text-sm text-muted">Nenhuma venda nesse período.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-bg text-left text-xs font-semibold uppercase tracking-wide text-muted">
                <th className="px-4 py-3">Pedido</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">ID do cliente</th>
                <th className="px-4 py-3">Peças</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {vendas.map((v) => (
                <tr key={v.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-ink">#{v.display_id}</td>
                  <td className="px-4 py-3 text-muted">{new Date(v.created_at).toLocaleDateString("pt-BR")}</td>
                  <td className="px-4 py-3 text-ink">{nomeDoCliente(v)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted">{v.customer_id ? idPessoal(v.customer_id) : "—"}</td>
                  <td className="px-4 py-3 text-muted">
                    {(v.items ?? []).map((i) => `${i.quantity}× ${i.product_title}${i.variant_title ? ` (${i.variant_title})` : ""}`).join(", ")}
                  </td>
                  <td className="px-4 py-3 text-right text-ink">{formatMoney(Number(v.total ?? 0), v.currency_code)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-surface p-5">
        <div className="max-w-lg text-sm text-muted">
          <strong className="text-ink">Gerar códigos para a fábrica.</strong> Baixa um arquivo .zip com o QR e o código de cada
          peça vendida no período, junto com o nome e o ID do cliente — para a fábrica anexar a etiqueta certa em cada roupa.
        </div>
        {pecas > 0 ? (
          <a
            href={`/vendas/codigos?start=${inicio}&end=${fim}`}
            className="rounded-md bg-accent px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
          >
            Gerar códigos (.zip)
          </a>
        ) : (
          <span className="rounded-md border border-border px-5 py-3 text-sm text-muted">Sem peças no período</span>
        )}
      </div>
    </div>
  );
}
