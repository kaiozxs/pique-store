import { MedusaError } from "@medusajs/framework/utils"
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { GetDashboardMetricsSchema } from "./middlewares"

const PERIOD_DAYS: Record<NonNullable<GetDashboardMetricsSchema["period"]>, number> = {
  "1d": 1,
  "7d": 7,
  "30d": 30,
}

const MAX_CUSTOM_RANGE_DAYS = 366
const DAY_MS = 24 * 60 * 60 * 1000

// O banco é um Postgres remoto (Supabase) — escanear até 1000 pedidos a cada
// abertura do dashboard fica lento. Cache curtinho em memória evita repetir
// a mesma consulta a cada refresh/navegação dentro da janela.
const CACHE_TTL_MS = 20_000
const metricsCache = new Map<string, { expiresAt: number; body: unknown }>()

// Dias em UTC do início ao fim, pra bater exatamente com o dia (UTC) que
// `created_at` cai — misturar aritmética de data local com toISOString()
// desloca os buckets em ±1 dia dependendo do fuso do servidor.
function resolveRange(query: GetDashboardMetricsSchema): { startMs: number; days: number } {
  if (query.start_date && query.end_date) {
    const startMs = Date.parse(`${query.start_date}T00:00:00.000Z`)
    const endMs = Date.parse(`${query.end_date}T00:00:00.000Z`)
    if (endMs < startMs) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "end_date precisa ser depois de start_date.")
    }
    const days = Math.round((endMs - startMs) / DAY_MS) + 1
    if (days > MAX_CUSTOM_RANGE_DAYS) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, `Período máximo de ${MAX_CUSTOM_RANGE_DAYS} dias.`)
    }
    return { startMs, days }
  }

  const days = PERIOD_DAYS[query.period ?? "30d"]
  const today = new Date()
  const todayUtcMidnight = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  return { startMs: todayUtcMidnight - (days - 1) * DAY_MS, days }
}

export async function GET(
  req: MedusaRequest<never, GetDashboardMetricsSchema>,
  res: MedusaResponse
) {
  const { startMs, days } = resolveRange(req.validatedQuery)
  const startDate = new Date(startMs)
  const endDate = new Date(startMs + days * DAY_MS)

  const cacheKey = `${startMs}:${days}`
  const cached = metricsCache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) {
    return res.json(cached.body)
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["id", "total", "currency_code", "created_at", "status"],
    filters: { created_at: { $gte: startDate.toISOString(), $lt: endDate.toISOString() } },
    pagination: { take: 1000, skip: 0 },
  })

  const validOrders = orders.filter((o) => o.status !== "canceled")
  const currencyCode = validOrders[0]?.currency_code ?? "brl"
  const totalRevenue = validOrders.reduce((sum, o) => sum + o.total, 0)
  const orderCount = validOrders.length
  const averageOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0

  const revenueByDayMap = new Map<string, number>()
  for (const order of validOrders) {
    const day = new Date(order.created_at).toISOString().slice(0, 10)
    revenueByDayMap.set(day, (revenueByDayMap.get(day) ?? 0) + order.total)
  }

  const revenueByDay: { date: string; total: number }[] = []
  for (let i = 0; i < days; i++) {
    const key = new Date(startMs + i * DAY_MS).toISOString().slice(0, 10)
    revenueByDay.push({ date: key, total: revenueByDayMap.get(key) ?? 0 })
  }

  const body = {
    start_date: revenueByDay[0]?.date,
    end_date: revenueByDay[revenueByDay.length - 1]?.date,
    currency_code: currencyCode,
    total_revenue: totalRevenue,
    order_count: orderCount,
    average_order_value: averageOrderValue,
    revenue_by_day: revenueByDay,
  }
  metricsCache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, body })

  return res.json(body)
}
