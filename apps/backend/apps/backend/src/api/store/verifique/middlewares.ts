import { MiddlewareRoute, validateAndTransformQuery } from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"

export const GetVerifiqueSchema = z.object({
  code: z.string().min(1),
})

export type GetVerifiqueSchema = z.infer<typeof GetVerifiqueSchema>

export const verifiqueStoreMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/store/verifique",
    method: "GET",
    middlewares: [validateAndTransformQuery(GetVerifiqueSchema, {})],
  },
]
