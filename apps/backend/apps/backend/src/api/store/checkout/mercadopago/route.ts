import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError, Modules } from "@medusajs/framework/utils"
import { SubmitMercadoPagoDataSchema } from "./middlewares"

// Rota própria: o SDK do Medusa não expõe um jeito de "atualizar" os dados
// de uma payment session já criada (só de criar uma nova) — mas é
// exatamente isso que precisamos aqui. O Brick do Mercado Pago só gera o
// token no navegador, depois que a sessão de pagamento já existe; essa rota
// recebe esse token e grava na sessão, pra o `authorizePayment` do provider
// usar quando o carrinho for finalizado.
export async function POST(
  req: MedusaRequest<SubmitMercadoPagoDataSchema>,
  res: MedusaResponse
) {
  const { cart_id, ...paymentData } = req.validatedBody
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const {
    data: [cart],
  } = await query.graph({
    entity: "cart",
    fields: [
      "id",
      "payment_collection.payment_sessions.id",
      "payment_collection.payment_sessions.provider_id",
      "payment_collection.payment_sessions.data",
      "payment_collection.payment_sessions.amount",
      "payment_collection.payment_sessions.currency_code",
    ],
    filters: { id: cart_id },
  })

  const session = cart?.payment_collection?.payment_sessions?.find(
    (s: any) => s.provider_id === "pp_mercadopago"
  )

  if (!session) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "Nenhuma sessão de pagamento do Mercado Pago encontrada pra esse carrinho — inicie o pagamento antes de enviar os dados do cartão."
    )
  }

  const paymentModuleService = req.scope.resolve(Modules.PAYMENT)
  await paymentModuleService.updatePaymentSession({
    id: session.id,
    amount: session.amount,
    currency_code: session.currency_code,
    data: { ...session.data, ...paymentData },
  })

  res.json({ success: true })
}
