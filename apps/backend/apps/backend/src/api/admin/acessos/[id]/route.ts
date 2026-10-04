import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ACESSO_MODULE } from "../../../../modules/acesso"
import AcessoModuleService from "../../../../modules/acesso/service"

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const service: AcessoModuleService = req.scope.resolve(ACESSO_MODULE)
  await service.deleteAcessoes(req.params.id)
  return res.json({ id: req.params.id, deleted: true })
}
