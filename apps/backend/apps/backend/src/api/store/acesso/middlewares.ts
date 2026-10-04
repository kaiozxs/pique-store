import { authenticate, MiddlewareRoute } from "@medusajs/framework/http"

export const acessoStoreMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/store/acesso*",
    middlewares: [authenticate("customer", ["session", "bearer"])],
  },
]
