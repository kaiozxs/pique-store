import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { ACESSO_MODULE } from "../../../modules/acesso"
import AcessoModuleService from "../../../modules/acesso/service"
import { ConcederAcessoSchema } from "./middlewares"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service: AcessoModuleService = req.scope.resolve(ACESSO_MODULE)
  const clientes = req.scope.resolve(Modules.CUSTOMER)

  const customerId = typeof req.query.customer_id === "string" ? req.query.customer_id : undefined
  const acessos = await service.listAcessoes(customerId ? { customer_id: customerId } : {})

  const donos = acessos.length
    ? await clientes.listCustomers({ id: acessos.map((a) => a.customer_id) })
    : []
  const porId = new Map(donos.map((c) => [c.id, c]))

  return res.json({
    acessos: acessos.map((a) => ({
      id: a.id,
      customer_id: a.customer_id,
      papel: a.papel,
      email: porId.get(a.customer_id)?.email ?? null,
      nome:
        [porId.get(a.customer_id)?.first_name, porId.get(a.customer_id)?.last_name]
          .filter(Boolean)
          .join(" ") || null,
    })),
  })
}

export async function POST(req: MedusaRequest<ConcederAcessoSchema>, res: MedusaResponse) {
  const service: AcessoModuleService = req.scope.resolve(ACESSO_MODULE)
  const clientes = req.scope.resolve(Modules.CUSTOMER)
  const { email, papel } = req.validatedBody

  // Só quem já tem conta na loja pode receber acesso: o vínculo é com o
  // cliente, e é o login dele que abre o painel.
  const [cliente] = await clientes.listCustomers({ email: email.toLowerCase() })
  if (!cliente) {
    return res.status(404).json({ message: "Nenhuma conta da loja com esse e-mail. A pessoa precisa se cadastrar primeiro." })
  }

  const [existente] = await service.listAcessoes({ customer_id: cliente.id })
  const acesso = existente
    ? await service.updateAcessoes({ id: existente.id, papel })
    : await service.createAcessoes({ customer_id: cliente.id, papel })

  return res.json({ acesso })
}
