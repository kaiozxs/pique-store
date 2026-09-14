import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { GetDashboardMetricsSchema } from "./middlewares"

const PERIOD_DAYS: Record<GetDashboardMetricsSchema["period"], number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
}

// Sem endpoint de analytics pronto no Medusa — agrega direto a partir dos
// pedidos do período. Assume moeda única (só existe a região "Europe"/EUR
// hoje); se entrar uma segunda região/moeda, o faturamento total precisa
// separar por currency_code.
export async function GET(
  req: MedusaRequest<never, GetDashboardMetricsSchema>,
  res: MedusaResponse
) {
  const { period } = req.validatedQuery
  const days = PERIOD_DAYS[period]

  // Dias em UTC do início ao fim, pra bater exatamente com o dia (UTC) que
  // `created_at` cai — misturar aritmética de data local com toISOString()
  // desloca os buckets em ±1 dia dependendo do fuso do servidor.
  const today = new Date()
  const todayUtcMidnight = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  const startDateMs = todayUtcMidnight - (days - 1) * 24 * 60 * 60 * 1000
  const startDate = new Date(startDateMs)

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["id", "total", "currency_code", "created_at", "status"],
    filters: { created_at: { $gte: startDate.toISOString() } },
    pagination: { take: 1000, skip: 0 },
  })

  const validOrders = orders.filter((o) => o.status !== "canceled")
  const currencyCode = validOrders[0]?.currency_code ?? "eur"
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
    const key = new Date(startDateMs + i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    revenueByDay.push({ date: key, total: revenueByDayMap.get(key) ?? 0 })
  }

  return res.json({
    period,
    currency_code: currencyCode,
    total_revenue: totalRevenue,
    order_count: orderCount,
    average_order_value: averageOrderValue,
    revenue_by_day: revenueByDay,
  })
}
