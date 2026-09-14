import { defineMiddlewares } from "@medusajs/framework/http"
import { wabAdminMiddlewares } from "./admin/wab/middlewares"

export default defineMiddlewares({
  routes: [...wabAdminMiddlewares],
})
