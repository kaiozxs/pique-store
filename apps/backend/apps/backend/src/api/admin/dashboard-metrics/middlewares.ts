import { MiddlewareRoute, validateAndTransformQuery } from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"

export const GetDashboardMetricsSchema = z.object({
  period: z.enum(["7d", "30d", "90d"]).optional().default("30d"),
})

export type GetDashboardMetricsSchema = z.infer<typeof GetDashboardMetricsSchema>

export const dashboardMetricsAdminMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/admin/dashboard-metrics",
    method: "GET",
    middlewares: [validateAndTransformQuery(GetDashboardMetricsSchema, {})],
  },
]
