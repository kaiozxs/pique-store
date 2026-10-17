import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { VERIFICATION_MODULE } from "../modules/verification"
import VerificationModuleService from "../modules/verification/service"
import createPieceUnitsWorkflow from "../workflows/create-piece-units"

/**
 * Regra de negócio: cada peça vendida ganha um código único (e o QR da
 * etiqueta), já registrado no nome de quem comprou. Assim, no "Verifique seu
 * PIQUE", a peça aparece como autêntica e com o ID pessoal do comprador.
 *
 * Uma peça por unidade: 3 camisetas no mesmo item viram 3 códigos.
 */
export default async function gerarPecasDoPedido({ event: { data }, container }: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const verificacao: VerificationModuleService = container.resolve(VERIFICATION_MODULE)

  // O evento pode chegar repetido; não gerar códigos em dobro para o mesmo pedido.
  const existentes = await verificacao.listPieceUnits({ order_id: data.id }, { take: 1 })
  if (existentes.length > 0) return

  const { data: pedidos } = await query.graph({
    entity: "order",
    fields: ["id", "customer_id", "items.variant_id", "items.quantity"],
    filters: { id: data.id },
  })
  const pedido = pedidos[0]
  if (!pedido) return

  let total = 0
  for (const item of pedido.items ?? []) {
    const quantidade = Number(item?.quantity ?? 0)
    if (!item?.variant_id || quantidade <= 0) continue
    await createPieceUnitsWorkflow(container).run({
      input: {
        product_variant_id: item.variant_id,
        quantity: quantidade,
        customer_id: pedido.customer_id ?? null,
        order_id: pedido.id,
      },
    })
    total += quantidade
  }

  logger.info(`[pecas] pedido ${pedido.id}: ${total} código(s) de autenticidade gerado(s)`)
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
