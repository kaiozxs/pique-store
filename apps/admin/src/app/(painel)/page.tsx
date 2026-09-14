import Link from "next/link";
import { getDashboardMetrics, type DashboardPeriod } from "@/lib/dashboard";
import { formatMoney } from "@/lib/orders";

const PERIOD_LABEL: Record<DashboardPeriod, string> = {
  "7d": "7 dias",
  "30d": "30 dias",
  "90d": "90 dias",
};

// day é "YYYY-MM-DD" (dia calendário em UTC, vindo do backend). Formatar via
// `new Date(day)` e exibir em fuso local desloca a data em ±1 dia — então
// montamos "DD/MM/AAAA" direto das partes da string, sem passar por Date.
function formatDayLabel(day: string): string {
  const [year, month, date] = day.split("-");
  return `${date}/${month}/${year}`;
}

export default async function DashboardPage({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const period = (["7d", "30d", "90d"] as const).includes(params.period as DashboardPeriod)
    ? (params.period as DashboardPeriod)
    : "30d";

  const metrics = await getDashboardMetrics(period);
  const maxDay = Math.max(1, ...metrics.revenue_by_day.map((d) => d.total));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-ink">Dashboard</h1>
        <div className="flex gap-1 rounded-md border border-border bg-surface p-1 text-sm">
          {(Object.keys(PERIOD_LABEL) as DashboardPeriod[]).map((p) => (
            <Link
              key={p}
              href={`/?period=${p}`}
              className={`rounded px-3 py-1 ${
                p === period ? "bg-accent text-white" : "text-muted hover:bg-bg"
              }`}
            >
              {PERIOD_LABEL[p]}
            </Link>
          ))}
        </div>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-surface p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted">Faturamento</div>
          <div className="mt-2 text-2xl font-bold text-ink">
            {formatMoney(metrics.total_revenue, metrics.currency_code)}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-surface p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted">Pedidos</div>
          <div className="mt-2 text-2xl font-bold text-ink">{metrics.order_count}</div>
        </div>
        <div className="rounded-lg border border-border bg-surface p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted">Ticket médio</div>
          <div className="mt-2 text-2xl font-bold text-ink">
            {formatMoney(metrics.average_order_value, metrics.currency_code)}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-5">
        <div className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted">
          Faturamento por dia
        </div>
        <div className="flex h-40 gap-1">
          {metrics.revenue_by_day.map((day) => (
            <div key={day.date} className="group relative flex h-40 flex-1 flex-col justify-end">
              <div
                className="rounded-t bg-accent/70 transition-colors group-hover:bg-accent"
                style={{ height: `${Math.max(2, (day.total / maxDay) * 100)}%` }}
              />
              <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-ink px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100">
                {formatDayLabel(day.date)} —{" "}
                {formatMoney(day.total, metrics.currency_code)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
