import { MiddlewareRoute, validateAndTransformBody } from "@medusajs/framework"
import { z } from "@medusajs/framework/zod"

export const CreatePieceUnitsSchema = z.object({
  product_variant_id: z.string().min(1),
  quantity: z.number().int().min(1).max(500),
})

export type CreatePieceUnitsSchema = z.infer<typeof CreatePieceUnitsSchema>

export const pecasAdminMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/admin/pecas",
    method: "POST",
    middlewares: [validateAndTransformBody(CreatePieceUnitsSchema)],
  },
]
