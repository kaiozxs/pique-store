import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { DROP_SEMANA_MODULE } from "../../../modules/drop-semana"
import DropSemanaModuleService from "../../../modules/drop-semana/service"
import upsertDropWeekWorkflow from "../../../workflows/upsert-drop-week"
import { UpsertDropWeekSchema } from "./middlewares"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const dropService: DropSemanaModuleService = req.scope.resolve(DROP_SEMANA_MODULE)

  const [dropWeek] = await dropService.listDropWeeks({}, { take: 1 })
  if (!dropWeek) {
    return res.json({ drop_week: null, items: [] })
  }

  const items = await dropService.listDropWeekItems(
    { drop_week_id: dropWeek.id },
    { order: { position: "ASC" } }
  )

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "title", "thumbnail"],
    filters: { id: items.map((i) => i.product_id) },
  })
  const productById = new Map(products.map((p) => [p.id, p]))

  return res.json({
    drop_week: dropWeek,
    items: items.map((item) => ({
      ...item,
      product: productById.get(item.product_id) ?? null,
    })),
  })
}

export async function POST(req: MedusaRequest<UpsertDropWeekSchema>, res: MedusaResponse) {
  const { result } = await upsertDropWeekWorkflow(req.scope).run({
    input: req.validatedBody,
  })

  return res.json(result)
}
