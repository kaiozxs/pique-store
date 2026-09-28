import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { VERIFICATION_MODULE } from "../../../../modules/verification"
import VerificationModuleService from "../../../../modules/verification/service"

// As peças do cliente logado — o que alimenta "Minhas Coleções".
//
// Diferente de /store/verifique, que é público e mostra só o suficiente pra
// confirmar autenticidade, aqui quem pergunta é o próprio dono: pode ver o
// código da peça e a referência fiscal da compra dele. Continua sem expor
// nada de terceiros — o filtro é o id de quem está autenticado, nunca um id
// que venha na requisição.
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const verificationService: VerificationModuleService = req.scope.resolve(VERIFICATION_MODULE)

  const pieces = await verificationService.listPieceUnits({
    current_owner_customer_id: req.auth_context.actor_id,
  })

  if (pieces.length === 0) {
    return res.json({ pieces: [] })
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: variants } = await query.graph({
    entity: "product_variant",
    fields: ["id", "title", "product.title", "product.handle", "product.thumbnail"],
    filters: { id: pieces.map((p) => p.product_variant_id) },
  })
  const porVariante = new Map(variants.map((v) => [v.id, v]))

  return res.json({
    pieces: pieces.map((piece) => {
      const variant = porVariante.get(piece.product_variant_id)
      return {
        id: piece.id,
        unique_code: piece.unique_code,
        status: piece.status,
        invoice_reference: piece.invoice_reference,
        product: variant
          ? {
              title: variant.product?.title ?? null,
              handle: variant.product?.handle ?? null,
              thumbnail: variant.product?.thumbnail ?? null,
              variant_title: variant.title,
            }
          : null,
      }
    }),
  })
}
