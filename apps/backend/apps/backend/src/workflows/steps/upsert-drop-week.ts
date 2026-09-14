import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { DROP_SEMANA_MODULE } from "../../modules/drop-semana"
import DropSemanaModuleService from "../../modules/drop-semana/service"

type Input = {
  title?: string | null
  status?: "draft" | "published"
  product_ids: string[]
}

export const upsertDropWeekStep = createStep(
  "upsert-drop-week",
  async (input: Input, { container }) => {
    const dropService: DropSemanaModuleService = container.resolve(DROP_SEMANA_MODULE)

    const [existing] = await dropService.listDropWeeks({}, { take: 1 })

    let dropWeek
    let previous: { title: string | null; status: string; itemProductIds: string[] } | null = null

    if (existing) {
      const previousItems = await dropService.listDropWeekItems(
        { drop_week_id: existing.id },
        { order: { position: "ASC" } }
      )
      previous = {
        title: existing.title,
        status: existing.status,
        itemProductIds: previousItems.map((i) => i.product_id),
      }

      dropWeek = await dropService.updateDropWeeks({
        id: existing.id,
        title: input.title ?? null,
        status: input.status ?? "draft",
      })
      await dropService.deleteDropWeekItems({ drop_week_id: existing.id })
    } else {
      dropWeek = await dropService.createDropWeeks({
        title: input.title ?? null,
        status: input.status ?? "draft",
      })
    }

    const items = await dropService.createDropWeekItems(
      input.product_ids.map((product_id, index) => ({
        drop_week_id: dropWeek.id,
        product_id,
        position: index,
      }))
    )

    return new StepResponse({ dropWeek, items }, { dropWeekId: dropWeek.id, previous })
  },
  async (compensationData, { container }) => {
    if (!compensationData) return
    const dropService: DropSemanaModuleService = container.resolve(DROP_SEMANA_MODULE)

    await dropService.deleteDropWeekItems({ drop_week_id: compensationData.dropWeekId })

    if (compensationData.previous) {
      await dropService.updateDropWeeks({
        id: compensationData.dropWeekId,
        title: compensationData.previous.title,
        status: compensationData.previous.status as "draft" | "published",
      })
      if (compensationData.previous.itemProductIds.length > 0) {
        await dropService.createDropWeekItems(
          compensationData.previous.itemProductIds.map((product_id, index) => ({
            drop_week_id: compensationData.dropWeekId,
            product_id,
            position: index,
          }))
        )
      }
    } else {
      await dropService.deleteDropWeeks(compensationData.dropWeekId)
    }
  }
)
