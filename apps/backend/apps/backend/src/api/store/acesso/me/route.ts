import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ACESSO_MODULE } from "../../../../modules/acesso"
import AcessoModuleService from "../../../../modules/acesso/service"

// Diz ao próprio cliente logado se ele tem acesso ao painel e com qual papel.
// O id vem da autenticação, nunca da requisição.
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const service: AcessoModuleService = req.scope.resolve(ACESSO_MODULE)
  const [acesso] = await service.listAcessoes({ customer_id: req.auth_context.actor_id })

  return res.json({ papel: acesso?.papel ?? null, customer_id: req.auth_context.actor_id })
}
