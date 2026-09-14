import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { DROP_SEMANA_MODULE } from "../../../modules/drop-semana"
import DropSemanaModuleService from "../../../modules/drop-semana/service"

// Pública: só expõe a lista quando publicado. Retorna apenas os ids na ordem
// escolhida — a storefront busca os produtos completos (preço, imagens) na
// Store API normal, preservando essa ordem.
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const dropService: DropSemanaModuleService = req.scope.resolve(DROP_SEMANA_MODULE)

  const [dropWeek] = await dropService.listDropWeeks({ status: "published" }, { take: 1 })
  if (!dropWeek) {
    return res.json({ title: null, product_ids: [] })
  }

  const items = await dropService.listDropWeekItems(
    { drop_week_id: dropWeek.id },
    { order: { position: "ASC" } }
  )

  return res.json({ title: dropWeek.title, product_ids: items.map((i) => i.product_id) })
}
