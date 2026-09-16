import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { updateRegionsWorkflow } from "@medusajs/medusa/core-flows"

// Script pontual: vincula o provider "pp_mercadopago" (registrado em
// medusa-config.ts) à região existente — sem isso ele existe mas não
// aparece como opção de pagamento no checkout. `payment_providers` é
// substituição total, não soma — por isso lê o que já tem antes de
// escrever de volta (mantendo o pp_system_default de teste).
// Rodar com: npx medusa exec ./src/migration-scripts/add-mercadopago-provider.ts
export default async function addMercadoPagoProvider({ container }: { container: MedusaContainer }) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "name", "payment_providers.id"],
  })
  const region = regions[0]
  if (!region) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Nenhuma região encontrada.")
  }

  const existing = (region.payment_providers ?? []).map((p: any) => p.id)
  const providers = Array.from(new Set([...existing, "pp_mercadopago"]))

  await updateRegionsWorkflow(container).run({
    input: {
      selector: { id: region.id },
      update: { payment_providers: providers },
    },
  })

  logger.info(`Região "${region.name}": payment_providers agora é [${providers.join(", ")}].`)
}
