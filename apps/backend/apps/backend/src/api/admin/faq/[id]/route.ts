import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import updateFaqItemWorkflow from "../../../../workflows/update-faq-item"
import deleteFaqItemWorkflow from "../../../../workflows/delete-faq-item"
import { UpdateFaqItemSchema } from "../middlewares"

export async function POST(req: MedusaRequest<UpdateFaqItemSchema>, res: MedusaResponse) {
  const { result } = await updateFaqItemWorkflow(req.scope).run({
    input: { id: req.params.id, ...req.validatedBody },
  })

  return res.json(result)
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  await deleteFaqItemWorkflow(req.scope).run({ input: { id: req.params.id } })

  return res.json({ id: req.params.id, deleted: true })
}
