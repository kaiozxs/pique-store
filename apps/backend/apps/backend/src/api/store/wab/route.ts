import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { WAB_MODULE } from "../../../modules/wab"
import WabModuleService from "../../../modules/wab/service"

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
