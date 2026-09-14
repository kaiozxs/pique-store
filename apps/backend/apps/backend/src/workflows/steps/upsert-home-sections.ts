import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { HOME_CONFIG_MODULE } from "../../modules/home-config"
import HomeConfigModuleService from "../../modules/home-config/service"

type SectionType = "hero" | "drop_destaque" | "wab_teaser" | "dicas_destaque" | "apresentacao"

type Input = {
  sections: {
    type: SectionType
    position: number
    visible: boolean
    config?: Record<string, unknown> | null
  }[]
}

export const upsertHomeSectionsStep = createStep(
  "upsert-home-sections",
  async (input: Input, { container }) => {
    const homeConfigService: HomeConfigModuleService = container.resolve(HOME_CONFIG_MODULE)

    const existing = await homeConfigService.listHomeSections()
    const existingByType = new Map(existing.map((s) => [s.type, s]))
    const previous = existing.map((s) => ({
      type: s.type,
      position: s.position,
      visible: s.visible,
      config: s.config,
    }))

    for (const section of input.sections) {
      const current = existingByType.get(section.type)
      if (current) {
        await homeConfigService.updateHomeSections({
          id: current.id,
          position: section.position,
          visible: section.visible,
          config: section.config ?? null,
        })
      } else {
        await homeConfigService.createHomeSections({
          type: section.type,
          position: section.position,
          visible: section.visible,
          config: section.config ?? null,
        })
      }
    }

    const results = await homeConfigService.listHomeSections()

    return new StepResponse(results, previous)
  },
  async (previous, { container }) => {
    if (!previous) return
    const homeConfigService: HomeConfigModuleService = container.resolve(HOME_CONFIG_MODULE)

    for (const section of previous) {
      await homeConfigService.updateHomeSections({
        selector: { type: section.type },
        data: {
          position: section.position,
          visible: section.visible,
          config: section.config,
        },
      })
    }
  }
)
