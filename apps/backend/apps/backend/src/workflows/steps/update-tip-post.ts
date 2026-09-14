import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { DICAS_MODULE } from "../../modules/dicas"
import DicasModuleService from "../../modules/dicas/service"

type Input = {
  id: string
  title?: string
  slug?: string
  excerpt?: string | null
  body?: string
  cover_image?: string | null
  status?: "draft" | "published"
}

export const updateTipPostStep = createStep(
  "update-tip-post",
  async (input: Input, { container }) => {
    const dicasService: DicasModuleService = container.resolve(DICAS_MODULE)

    const previous = await dicasService.retrieveTipPost(input.id)

    const publishedAt =
      input.status === "published" && !previous.published_at ? new Date() : previous.published_at

    const post = await dicasService.updateTipPosts({
      id: input.id,
      title: input.title,
      slug: input.slug,
      excerpt: input.excerpt,
      body: input.body,
      cover_image: input.cover_image,
      status: input.status,
      published_at: publishedAt,
    })

    return new StepResponse(post, {
      id: previous.id,
      title: previous.title,
      slug: previous.slug,
      excerpt: previous.excerpt,
      body: previous.body,
      cover_image: previous.cover_image,
      status: previous.status,
      published_at: previous.published_at,
    })
  },
  async (previous, { container }) => {
    if (!previous) return
    const dicasService: DicasModuleService = container.resolve(DICAS_MODULE)
    await dicasService.updateTipPosts(previous)
  }
)
