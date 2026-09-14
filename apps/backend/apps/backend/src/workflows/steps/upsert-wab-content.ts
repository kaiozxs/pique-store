import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { WAB_MODULE } from "../../modules/wab"
import WabModuleService from "../../modules/wab/service"

type WabMedia = { url: string; type: "image" | "video" }
type WabMediaJson = { items: WabMedia[] }

type Input = {
  status?: "em_construcao" | "revelado" | "oculto"
  title?: string | null
  body?: string | null
  media?: WabMediaJson | null
}

export const upsertWabContentStep = createStep(
  "upsert-wab-content",
  async (input: Input, { container }) => {
    const wabService: WabModuleService = container.resolve(WAB_MODULE)

    const existing = await wabService.listWabContents({}, { take: 1 })
    const previous = existing[0] ?? null

    let record
    if (previous) {
      record = await wabService.updateWabContents({
        id: previous.id,
        ...input,
      })
    } else {
      record = await wabService.createWabContents({
        status: input.status ?? "em_construcao",
        title: input.title ?? null,
        body: input.body ?? null,
        media: input.media ?? null,
      })
    }

    return new StepResponse(record, previous)
  },
  async (previous, { container }) => {
    if (!previous) return
    const wabService: WabModuleService = container.resolve(WAB_MODULE)
    await wabService.updateWabContents({
      id: previous.id,
      status: previous.status,
      title: previous.title,
      body: previous.body,
      media: previous.media,
    })
  }
)
