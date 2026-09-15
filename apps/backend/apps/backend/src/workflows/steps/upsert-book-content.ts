import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { BOOK_MODULE } from "../../modules/book"
import BookModuleService from "../../modules/book/service"

type BookMedia = { url: string; type: "image" | "video" }
type BookMediaJson = { items: BookMedia[] }

type Input = {
  status?: "em_construcao" | "revelado" | "oculto"
  title?: string | null
  body?: string | null
  media?: BookMediaJson | null
}

export const upsertBookContentStep = createStep(
  "upsert-book-content",
  async (input: Input, { container }) => {
    const bookService: BookModuleService = container.resolve(BOOK_MODULE)

    const existing = await bookService.listBookContents({}, { take: 1 })
    const previous = existing[0] ?? null

    let record
    if (previous) {
      record = await bookService.updateBookContents({
        id: previous.id,
        ...input,
      })
    } else {
      record = await bookService.createBookContents({
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
    const bookService: BookModuleService = container.resolve(BOOK_MODULE)
    await bookService.updateBookContents({
      id: previous.id,
      status: previous.status,
      title: previous.title,
      body: previous.body,
      media: previous.media,
    })
  }
)
