import { AuthenticatedMedusaRequest, MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BOOK_MODULE } from "../../../modules/book"
import BookModuleService from "../../../modules/book/service"
import upsertBookContentWorkflow from "../../../workflows/upsert-book-content"
import { UpsertBookContentSchema } from "./middlewares"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const bookService: BookModuleService = req.scope.resolve(BOOK_MODULE)
  const [existing] = await bookService.listBookContents({}, { take: 1 })

  return res.json({
    book_content: existing ?? {
      status: "em_construcao",
      title: null,
      body: null,
      media: null,
    },
  })
}

export async function POST(
  req: AuthenticatedMedusaRequest<UpsertBookContentSchema>,
  res: MedusaResponse
) {
  const { result } = await upsertBookContentWorkflow(req.scope).run({
    input: req.validatedBody,
  })

  return res.json({ book_content: result.bookContent })
}
