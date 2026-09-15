import { defineMiddlewares } from "@medusajs/framework/http"
import { bookAdminMiddlewares } from "./admin/book/middlewares"
import { pecasAdminMiddlewares } from "./admin/pecas/middlewares"
import { dropSemanaAdminMiddlewares } from "./admin/drop-semana/middlewares"
import { homeConfigAdminMiddlewares } from "./admin/home-config/middlewares"
import { dicasAdminMiddlewares } from "./admin/dicas/middlewares"
import { faqAdminMiddlewares } from "./admin/faq/middlewares"
import { dashboardMetricsAdminMiddlewares } from "./admin/dashboard-metrics/middlewares"
import { verifiqueStoreMiddlewares } from "./store/verifique/middlewares"
import { pecasStoreMiddlewares } from "./store/pecas/middlewares"

export default defineMiddlewares({
  routes: [
    ...bookAdminMiddlewares,
    ...pecasAdminMiddlewares,
    ...dropSemanaAdminMiddlewares,
    ...homeConfigAdminMiddlewares,
    ...dicasAdminMiddlewares,
    ...faqAdminMiddlewares,
    ...dashboardMetricsAdminMiddlewares,
    ...verifiqueStoreMiddlewares,
    ...pecasStoreMiddlewares,
  ],
})
