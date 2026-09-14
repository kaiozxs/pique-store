import { AuthenticatedMedusaRequest, MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { WAB_MODULE } from "../../../modules/wab"
import WabModuleService from "../../../modules/wab/service"
import upsertWabContentWorkflow from "../../../workflows/upsert-wab-content"
import { UpsertWabContentSchema } from "./middlewares"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const wabService: WabModuleService = req.scope.resolve(WAB_MODULE)
  const [existing] = await wabService.listWabContents({}, { take: 1 })

  return res.json({
    wab_content: existing ?? {
      status: "em_construcao",
      title: null,
      body: null,
      media: null,
    },
  })
}

export async function POST(
  req: AuthenticatedMedusaRequest<UpsertWabContentSchema>,
  res: MedusaResponse
) {
  const { result } = await upsertWabContentWorkflow(req.scope).run({
    input: req.validatedBody,
  })

  return res.json({ wab_content: result.wabContent })
}
