import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { HOME_CONFIG_MODULE } from "../../../modules/home-config"
import HomeConfigModuleService from "../../../modules/home-config/service"
import upsertHomeSectionsWorkflow from "../../../workflows/upsert-home-sections"
import { UpsertHomeSectionsSchema } from "./middlewares"

const SECTION_TYPES = ["hero", "drop_destaque", "wab_teaser", "dicas_destaque", "apresentacao"] as const

const DEFAULT_LABELS: Record<(typeof SECTION_TYPES)[number], string> = {
  hero: "Hero (abertura)",
  drop_destaque: "Drop da Semana",
  wab_teaser: "WAB",
  dicas_destaque: "Dicas",
  apresentacao: "Apresentação da PIQUE",
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const homeConfigService: HomeConfigModuleService = req.scope.resolve(HOME_CONFIG_MODULE)
  const existing = await homeConfigService.listHomeSections()
  const existingByType = new Map(existing.map((s) => [s.type, s]))

  const sections = SECTION_TYPES.map((type, index) => {
    const found = existingByType.get(type)
    return {
      type,
      label: DEFAULT_LABELS[type],
      position: found?.position ?? index,
      visible: found?.visible ?? true,
      config: found?.config ?? null,
    }
  }).sort((a, b) => a.position - b.position)

  return res.json({ sections })
}

export async function POST(req: MedusaRequest<UpsertHomeSectionsSchema>, res: MedusaResponse) {
  const { result } = await upsertHomeSectionsWorkflow(req.scope).run({
    input: req.validatedBody,
  })

  return res.json(result)
}
