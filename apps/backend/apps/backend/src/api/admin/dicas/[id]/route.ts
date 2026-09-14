import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { DICAS_MODULE } from "../../../../modules/dicas"
import DicasModuleService from "../../../../modules/dicas/service"
import updateTipPostWorkflow from "../../../../workflows/update-tip-post"
import deleteTipPostWorkflow from "../../../../workflows/delete-tip-post"
import { UpdateTipPostSchema } from "../middlewares"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const dicasService: DicasModuleService = req.scope.resolve(DICAS_MODULE)
  const post = await dicasService.retrieveTipPost(req.params.id)

  return res.json({ tip_post: post })
}

export async function POST(req: MedusaRequest<UpdateTipPostSchema>, res: MedusaResponse) {
  const { result } = await updateTipPostWorkflow(req.scope).run({
    input: { id: req.params.id, ...req.validatedBody },
  })

  return res.json(result)
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  await deleteTipPostWorkflow(req.scope).run({ input: { id: req.params.id } })

  return res.json({ id: req.params.id, deleted: true })
}
