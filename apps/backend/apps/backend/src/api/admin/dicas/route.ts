import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { DICAS_MODULE } from "../../../modules/dicas"
import DicasModuleService from "../../../modules/dicas/service"
import createTipPostWorkflow from "../../../workflows/create-tip-post"
import { CreateTipPostSchema } from "./middlewares"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const dicasService: DicasModuleService = req.scope.resolve(DICAS_MODULE)
  const [posts, count] = await dicasService.listAndCountTipPosts(
    {},
    { order: { created_at: "DESC" } }
  )

  return res.json({ tip_posts: posts, count })
}

export async function POST(req: MedusaRequest<CreateTipPostSchema>, res: MedusaResponse) {
  const { result } = await createTipPostWorkflow(req.scope).run({
    input: req.validatedBody,
  })

  return res.json(result)
}
