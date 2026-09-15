import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BOOK_MODULE } from "../../../modules/book"
import BookModuleService from "../../../modules/book/service"

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
