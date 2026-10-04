import { MiddlewareRoute, validateAndTransformBody } from "@medusajs/framework"
import { z } from "@medusajs/framework/zod"

export const ConcederAcessoSchema = z.object({
  email: z.string().email(),
  papel: z.enum(["dono", "lojista"]),
})
export type ConcederAcessoSchema = z.infer<typeof ConcederAcessoSchema>

export const acessosAdminMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/admin/acessos",
    method: "POST",
    middlewares: [validateAndTransformBody(ConcederAcessoSchema)],
  },
]
