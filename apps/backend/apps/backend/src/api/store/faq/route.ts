import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { FAQ_MODULE } from "../../../modules/faq"
import FaqModuleService from "../../../modules/faq/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const faqService: FaqModuleService = req.scope.resolve(FAQ_MODULE)
  const items = await faqService.listFaqItems(
    { published: true },
    { order: { category: "ASC", position: "ASC" } }
  )

  return res.json({
    faq_items: items.map((i) => ({
      category: i.category,
      question: i.question,
      answer: i.answer,
    })),
  })
}
