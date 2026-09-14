import { defineMiddlewares } from "@medusajs/framework/http"
import { wabAdminMiddlewares } from "./admin/wab/middlewares"
import { pecasAdminMiddlewares } from "./admin/pecas/middlewares"
import { verifiqueStoreMiddlewares } from "./store/verifique/middlewares"
import { pecasStoreMiddlewares } from "./store/pecas/middlewares"

export default defineMiddlewares({
  routes: [
    ...wabAdminMiddlewares,
    ...pecasAdminMiddlewares,
    ...verifiqueStoreMiddlewares,
    ...pecasStoreMiddlewares,
  ],
})
