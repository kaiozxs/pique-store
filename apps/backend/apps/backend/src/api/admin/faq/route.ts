import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { FAQ_MODULE } from "../../../modules/faq"
import FaqModuleService from "../../../modules/faq/service"
import createFaqItemWorkflow from "../../../workflows/create-faq-item"
import { CreateFaqItemSchema } from "./middlewares"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const faqService: FaqModuleService = req.scope.resolve(FAQ_MODULE)
  const items = await faqService.listFaqItems({}, { order: { category: "ASC", position: "ASC" } })

  return res.json({ faq_items: items })
}

export async function POST(req: MedusaRequest<CreateFaqItemSchema>, res: MedusaResponse) {
  const { result } = await createFaqItemWorkflow(req.scope).run({
    input: req.validatedBody,
  })

  return res.json(result)
}
