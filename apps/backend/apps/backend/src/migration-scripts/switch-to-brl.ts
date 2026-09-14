import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import {
  updateRegionsWorkflow,
  updateServiceZonesWorkflow,
  updateShippingOptionsWorkflow,
  updateStoresWorkflow,
  updateProductVariantsWorkflow,
} from "@medusajs/medusa/core-flows"

// Script de manutenção pontual: troca a loja inteira de EUR (região "Europe")
// pra BRL (região "Brasil"), mantendo o MESMO valor numérico que já estava em
// EUR — é um placeholder pra troca de moeda, não uma conversão de câmbio; o
// preço de verdade em R$ pode ser ajustado depois no admin nativo do Medusa
// (Produtos > preços). Rodar uma vez com:
//   npx medusa exec ./src/migration-scripts/switch-to-brl.ts
export default async function switchToBrl({ container }: { container: MedusaContainer }) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data: stores } = await query.graph({ entity: "store", fields: ["id"] })
  const store = stores[0]
  if (!store) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Nenhuma store encontrada.")
  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: { supported_currencies: [{ currency_code: "brl", is_default: true }] },
    },
  })
  logger.info("Store: moeda suportada agora é só BRL.")

  const { data: regions } = await query.graph({ entity: "region", fields: ["id", "name"] })
  const region = regions[0]
  if (!region) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Nenhuma região encontrada.")
  await updateRegionsWorkflow(container).run({
    input: {
      selector: { id: region.id },
      update: {
        name: "Brasil",
        currency_code: "brl",
        countries: ["br"],
        payment_providers: ["pp_system_default"],
      },
    },
  })
  logger.info(`Região "${region.name}" -> "Brasil" (BRL, país BR).`)

  const { data: serviceZones } = await query.graph({ entity: "service_zone", fields: ["id", "name"] })
  for (const zone of serviceZones) {
    await updateServiceZonesWorkflow(container).run({
      input: {
        selector: { id: zone.id },
        update: { geo_zones: [{ type: "country", country_code: "br" }] },
      },
    })
    logger.info(`Service zone "${zone.name}" -> cobre Brasil (BR).`)
  }

  const { data: shippingOptions } = await query.graph({
    entity: "shipping_option",
    fields: ["id", "name", "prices.currency_code", "prices.amount"],
  })
  for (const option of shippingOptions as any[]) {
    const prices = (option.prices ?? []) as { currency_code: string; amount: number }[]
    const reference = prices.find((p) => p.currency_code === "eur") ?? prices[0]
    const amount = reference?.amount ?? 10
    await updateShippingOptionsWorkflow(container).run({
      input: [{ id: option.id, prices: [{ currency_code: "brl", amount }] }],
    })
    logger.info(`Frete "${option.name}" -> BRL ${amount}.`)
  }

  const { data: variants } = await query.graph({
    entity: "product_variant",
    fields: ["id", "title", "prices.currency_code", "prices.amount"],
  })
  let updatedVariants = 0
  for (const variant of variants as any[]) {
    const prices = (variant.prices ?? []) as { currency_code: string; amount: number }[]
    const reference = prices.find((p) => p.currency_code === "eur") ?? prices[0]
    if (!reference) continue
    await updateProductVariantsWorkflow(container).run({
      input: {
        selector: { id: variant.id },
        update: { prices: [{ currency_code: "brl", amount: reference.amount }] },
      },
    })
    updatedVariants += 1
  }
  logger.info(`${updatedVariants} variantes de produto atualizadas pra BRL.`)

  logger.info("Migração EUR -> BRL concluída.")
}
