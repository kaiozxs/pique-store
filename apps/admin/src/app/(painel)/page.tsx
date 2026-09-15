import Link from "next/link";
import { getDashboardMetrics, type DashboardPeriod, type DashboardRangeQuery } from "@/lib/dashboard";
import { formatMoney } from "@/lib/orders";
import { DateRangeCalendar } from "@/components/DateRangeCalendar";

const PERIOD_LABEL: Record<DashboardPeriod, string> = {
  "1d": "1 dia",
  "7d": "7 dias",
  "30d": "1 mês",
};

// day é "YYYY-MM-DD" (dia calendário em UTC, vindo do backend). Formatar via
// `new Date(day)` e exibir em fuso local desloca a data em ±1 dia — então
// montamos "DD/MM/AAAA" direto das partes da string, sem passar por Date.
function formatDayLabel(day: string): string {
  const [year, month, date] = day.split("-");
  return `${date}/${month}/${year}`;
}

// Arredonda pra cima pro próximo "número redondo" (1/2/5 × 10^n), pra ter
// linhas de grade com valores limpos no eixo Y em vez de frações do máximo.
function niceCeil(value: number): number {
  if (value <= 0) return 10;
  const exponent = Math.floor(Math.log10(value));
  const fraction = value / 10 ** exponent;
  const niceFraction = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  return niceFraction * 10 ** exponent;
}

export default async function DashboardPage({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const start = typeof params.start === "string" ? params.start : null;
  const end = typeof params.end === "string" ? params.end : null;
  const isCustomRange = Boolean(start && end);

  const period = (["1d", "7d", "30d"] as const).includes(params.period as DashboardPeriod)
    ? (params.period as DashboardPeriod)
    : "30d";

  const range: DashboardRangeQuery = isCustomRange ? { start_date: start!, end_date: end! } : { period };
  const metrics = await getDashboardMetrics(range);
  const niceMax = niceCeil(Math.max(1, ...metrics.revenue_by_day.map((d) => d.total)));
  const gridLines = [4, 3, 2, 1, 0].map((i) => (niceMax * i) / 4);

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl uppercase tracking-tight text-ink">Dashboard</h1>

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
        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">Visão geral</div>
        <div className="mb-4 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-ink">
            {formatMoney(metrics.average_order_value, metrics.currency_code)}
          </span>
          <span className="text-sm text-muted">Ticket médio no período</span>
        </div>

        <div className="flex gap-3">
          <div className="flex h-48 flex-1 gap-1">
            {metrics.revenue_by_day.map((day) => (
              <div key={day.date} className="group relative flex h-48 flex-1 flex-col justify-end">
                <div
                  className="transition-opacity group-hover:opacity-90"
                  style={{
                    height: `${Math.max(2, (day.total / niceMax) * 100)}%`,
                    background: "linear-gradient(180deg, rgba(226,24,51,0.35) 0%, rgba(226,24,51,0.95) 100%)",
                  }}
                />
                <div className="pointer-events-none absolute -top-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white opacity-0 shadow-lg group-hover:opacity-100">
                  {formatDayLabel(day.date)} — {formatMoney(day.total, metrics.currency_code)}
                </div>
                {metrics.revenue_by_day.length <= 31 && (
                  <div className="mt-2 text-center text-[10px] text-muted">{day.date.slice(8, 10)}</div>
                )}
              </div>
            ))}
          </div>

          <div className="flex h-48 w-14 flex-col justify-between pb-5 text-right text-[11px] text-muted">
            {gridLines.map((value) => (
              <div key={value}>{formatMoney(value, metrics.currency_code)}</div>
            ))}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
          <span className="text-xs text-muted">
            {formatDayLabel(metrics.start_date)} — {formatDayLabel(metrics.end_date)}
          </span>
          <div className="flex items-center gap-1">
            {(Object.keys(PERIOD_LABEL) as DashboardPeriod[]).map((p) => (
              <Link
                key={p}
                href={`/?period=${p}`}
                className={`rounded px-3 py-1 text-sm ${
                  !isCustomRange && p === period ? "bg-accent text-white" : "text-muted hover:bg-bg"
                }`}
              >
                {PERIOD_LABEL[p]}
              </Link>
            ))}
            <DateRangeCalendar initialStart={start ?? undefined} initialEnd={end ?? undefined} />
          </div>
        </div>
      </div>
    </div>
  );
}
