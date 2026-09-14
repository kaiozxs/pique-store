import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { VERIFICATION_MODULE } from "../../../modules/verification"
import VerificationModuleService from "../../../modules/verification/service"
import { GetVerifiqueSchema } from "./middlewares"

// Rota pública: expõe só o necessário pra confirmar autenticidade.
// Nunca retorna owner/pedido/nota fiscal aqui.
export async function GET(
  req: MedusaRequest<never, GetVerifiqueSchema>,
  res: MedusaResponse
) {
  const verificationService: VerificationModuleService = req.scope.resolve(VERIFICATION_MODULE)
  const { code } = req.validatedQuery

  const [piece] = await verificationService.listPieceUnits({ unique_code: code.trim().toUpperCase() })

  if (!piece) {
    return res.json({ valid: false })
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: variants } = await query.graph({
    entity: "product_variant",
    fields: ["id", "title", "product.title", "product.thumbnail"],
    filters: { id: piece.product_variant_id },
  })
  const variant = variants[0]

  return res.json({
    valid: piece.status !== "revogado",
    status: piece.status,
    product: variant
      ? {
          title: variant.product?.title ?? null,
          variant_title: variant.title,
          thumbnail: variant.product?.thumbnail ?? null,
        }
      : null,
  })
}
