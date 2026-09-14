import { MiddlewareRoute, validateAndTransformQuery } from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

export const GetDashboardMetricsSchema = z
  .object({
    period: z.enum(["1d", "7d", "30d"]).optional(),
    start_date: z.string().regex(DATE_ONLY, "Use o formato AAAA-MM-DD.").optional(),
    end_date: z.string().regex(DATE_ONLY, "Use o formato AAAA-MM-DD.").optional(),
  })
  .refine((data) => (data.start_date == null) === (data.end_date == null), {
    message: "Informe start_date e end_date juntos, ou nenhum dos dois.",
  })

export type GetDashboardMetricsSchema = z.infer<typeof GetDashboardMetricsSchema>

export const dashboardMetricsAdminMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/admin/dashboard-metrics",
    method: "GET",
    middlewares: [validateAndTransformQuery(GetDashboardMetricsSchema, {})],
  },
]
