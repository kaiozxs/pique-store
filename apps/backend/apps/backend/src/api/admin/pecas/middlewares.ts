import { MiddlewareRoute, validateAndTransformBody } from "@medusajs/framework"
import { z } from "@medusajs/framework/zod"

export const CreatePieceUnitsSchema = z.object({
  product_variant_id: z.string().min(1),
  quantity: z.number().int().min(1).max(500),
})

export type CreatePieceUnitsSchema = z.infer<typeof CreatePieceUnitsSchema>

// Mesmo formato dos códigos gerados pelo backend: XXXX-XXXX-XXXX, sem 0/O/1/I.
export const VincularEtiquetaSchema = z.object({
  unique_code: z
    .string()
    .transform((v) => v.trim().toUpperCase())
    .pipe(z.string().regex(/^[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/, "Código de etiqueta inválido")),
  product_variant_id: z.string().min(1),
})

export type VincularEtiquetaSchema = z.infer<typeof VincularEtiquetaSchema>

export const pecasAdminMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/admin/pecas",
    method: "POST",
    middlewares: [validateAndTransformBody(CreatePieceUnitsSchema)],
  },
  {
    matcher: "/admin/pecas/vincular",
    method: "POST",
    middlewares: [validateAndTransformBody(VincularEtiquetaSchema)],
  },
]
