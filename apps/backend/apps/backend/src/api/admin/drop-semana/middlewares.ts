import { MiddlewareRoute, validateAndTransformBody } from "@medusajs/framework"
import { z } from "@medusajs/framework/zod"

export const UpsertDropWeekSchema = z.object({
  title: z.string().nullable().optional(),
  status: z.enum(["draft", "published"]).optional(),
  product_ids: z.array(z.string().min(1)),
})

export type UpsertDropWeekSchema = z.infer<typeof UpsertDropWeekSchema>

export const dropSemanaAdminMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/admin/drop-semana",
    method: "POST",
    middlewares: [validateAndTransformBody(UpsertDropWeekSchema)],
  },
]
