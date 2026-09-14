import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { HOME_CONFIG_MODULE } from "../../../modules/home-config"
import HomeConfigModuleService from "../../../modules/home-config/service"

const SECTION_TYPES = ["hero", "drop_destaque", "wab_teaser", "dicas_destaque", "apresentacao"] as const

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const homeConfigService: HomeConfigModuleService = req.scope.resolve(HOME_CONFIG_MODULE)
  const existing = await homeConfigService.listHomeSections()
  const existingByType = new Map(existing.map((s) => [s.type, s]))

  const sections = SECTION_TYPES.map((type, index) => ({
    type,
    position: existingByType.get(type)?.position ?? index,
    visible: existingByType.get(type)?.visible ?? true,
    config: existingByType.get(type)?.config ?? null,
  }))
    .filter((s) => s.visible)
    .sort((a, b) => a.position - b.position)

  return res.json({ sections })
}
