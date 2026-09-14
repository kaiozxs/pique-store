import { defineMiddlewares } from "@medusajs/framework/http"
import { wabAdminMiddlewares } from "./admin/wab/middlewares"
import { pecasAdminMiddlewares } from "./admin/pecas/middlewares"
import { dropSemanaAdminMiddlewares } from "./admin/drop-semana/middlewares"
import { homeConfigAdminMiddlewares } from "./admin/home-config/middlewares"
import { verifiqueStoreMiddlewares } from "./store/verifique/middlewares"
import { pecasStoreMiddlewares } from "./store/pecas/middlewares"

export default defineMiddlewares({
  routes: [
    ...wabAdminMiddlewares,
    ...pecasAdminMiddlewares,
    ...dropSemanaAdminMiddlewares,
    ...homeConfigAdminMiddlewares,
    ...verifiqueStoreMiddlewares,
    ...pecasStoreMiddlewares,
  ],
})
