import { MiddlewareRoute, validateAndTransformQuery } from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import { rateLimit } from "../../middlewares/rate-limit"

export const GetVerifiqueSchema = z.object({
  code: z.string().min(1),
})

export type GetVerifiqueSchema = z.infer<typeof GetVerifiqueSchema>

export const verifiqueStoreMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/store/verifique",
    method: "GET",
    // Rota pública sem autenticação — sem isso, dava pra fazer scraping em
    // volume ilimitado (ou tentar força bruta nos códigos, mesmo com ~60
    // bits de entropia, sem custo nenhum de tentar).
    middlewares: [rateLimit({ windowMs: 60_000, max: 20 }), validateAndTransformQuery(GetVerifiqueSchema, {})],
  },
]
