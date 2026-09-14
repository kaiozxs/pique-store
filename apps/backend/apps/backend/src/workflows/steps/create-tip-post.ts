import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { DICAS_MODULE } from "../../modules/dicas"
import DicasModuleService from "../../modules/dicas/service"

type Input = {
  title: string
  slug: string
  excerpt?: string | null
  body: string
  cover_image?: string | null
  status: "draft" | "published"
}

export const createTipPostStep = createStep(
  "create-tip-post",
  async (input: Input, { container }) => {
    const dicasService: DicasModuleService = container.resolve(DICAS_MODULE)

    const [post] = await dicasService.createTipPosts([
      {
        ...input,
        published_at: input.status === "published" ? new Date() : null,
      },
    ])

    return new StepResponse(post, post.id)
  },
  async (id, { container }) => {
    if (!id) return
    const dicasService: DicasModuleService = container.resolve(DICAS_MODULE)
    await dicasService.deleteTipPosts(id)
  }
)
