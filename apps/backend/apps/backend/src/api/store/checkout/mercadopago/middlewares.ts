import { MiddlewareRoute, validateAndTransformBody } from "@medusajs/framework"
import { z } from "@medusajs/framework/zod"

export const SubmitMercadoPagoDataSchema = z.object({
  cart_id: z.string().min(1),
  token: z.string().min(1),
  payment_method_id: z.string().min(1),
  installments: z.number().int().min(1).optional(),
  issuer_id: z.union([z.string(), z.number()]).optional(),
  payer_email: z.email().optional(),
})

export type SubmitMercadoPagoDataSchema = z.infer<typeof SubmitMercadoPagoDataSchema>

export const mercadoPagoStoreMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/store/checkout/mercadopago",
    method: "POST",
    middlewares: [validateAndTransformBody(SubmitMercadoPagoDataSchema)],
  },
]
