import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { VERIFICATION_MODULE } from "../../../modules/verification"
import VerificationModuleService from "../../../modules/verification/service"
import { GetVerifiqueSchema } from "./middlewares"

// Mesmo formato do ID pessoal mostrado na conta do cliente (storefront,
// lib/customer.ts → idPessoal). É um código derivado: identifica o dono sem
// expor nome, e-mail ou o id interno.
function idPessoal(customerId: string): string {
  return `PQ-${customerId.replace(/^cus_/i, "").slice(-8).toUpperCase()}`
}

// Rota pública: confirma autenticidade e mostra a quem a peça pertence pelo
// ID pessoal. Nunca devolve nome, e-mail, id interno, pedido ou nota fiscal.
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
    fields: ["id", "title", "product.title", "product.handle", "product.thumbnail"],
    filters: { id: piece.product_variant_id },
  })
  const variant = variants[0]

  // Data da compra, só a data — o pedido em si continua privado.
  let purchasedAt: string | null = null
  if (piece.order_id) {
    const { data: orders } = await query.graph({
      entity: "order",
      fields: ["created_at"],
      filters: { id: piece.order_id },
    })
    const criado = orders[0]?.created_at
    purchasedAt = criado ? new Date(criado as string | Date).toISOString() : null
  }

  return res.json({
    valid: piece.status !== "revogado",
    status: piece.status,
    code: piece.unique_code,
    owner_id: piece.current_owner_customer_id ? idPessoal(piece.current_owner_customer_id) : null,
    purchased_at: purchasedAt,
    product: variant
      ? {
          title: variant.product?.title ?? null,
          handle: variant.product?.handle ?? null,
          variant_title: variant.title,
          thumbnail: variant.product?.thumbnail ?? null,
        }
      : null,
  })
}
