import { authenticate, MiddlewareRoute, validateAndTransformBody } from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"

export const RegisterPieceSchema = z.object({
  unique_code: z.string().min(1),
})
export type RegisterPieceSchema = z.infer<typeof RegisterPieceSchema>

export const RequestTransferSchema = z.object({
  unique_code: z.string().min(1),
})
export type RequestTransferSchema = z.infer<typeof RequestTransferSchema>

export const AuthorizeTransferSchema = z.object({
  decision: z.enum(["concluida", "rejeitada"]),
})
export type AuthorizeTransferSchema = z.infer<typeof AuthorizeTransferSchema>

export const pecasStoreMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/store/pecas*",
    middlewares: [authenticate("customer", ["session", "bearer"])],
  },
  {
    matcher: "/store/pecas/registrar",
    method: "POST",
    middlewares: [validateAndTransformBody(RegisterPieceSchema)],
  },
  {
    matcher: "/store/pecas/transferencias",
    method: "POST",
    middlewares: [validateAndTransformBody(RequestTransferSchema)],
  },
  {
    matcher: "/store/pecas/transferencias/:id/autorizar",
    method: "POST",
    middlewares: [validateAndTransformBody(AuthorizeTransferSchema)],
  },
]
