import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { updateProductCategoriesWorkflow, updateProductsWorkflow } from "@medusajs/medusa/core-flows"

// Script pontual: renomeia as categorias genéricas do seed demo do Medusa
// (Shirts/Sweatshirts/Pants/Merch) para categorias reais da PIQUE, usadas no
// mega-menu do storefront. Só "Camisetas" fica ativa (tem produto publicado);
// as demais ficam inativas — o mega-menu mostra "EM BREVE" pra elas.
// Rodar com: npx medusa exec ./src/migration-scripts/set-real-categories.ts
export default async function setRealCategories({ container }: { container: MedusaContainer }) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data: categories } = await query.graph({
    entity: "product_category",
    fields: ["id", "name"],
  })

  const shirts = categories.find((c) => c.name === "Shirts")
  const sweatshirts = categories.find((c) => c.name === "Sweatshirts")
  const pants = categories.find((c) => c.name === "Pants")
  const merch = categories.find((c) => c.name === "Merch")

  if (!shirts || !sweatshirts || !pants || !merch) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Não encontrei as 4 categorias demo esperadas.")
  }

  await updateProductCategoriesWorkflow(container).run({
    input: { selector: { id: shirts.id }, update: { name: "Camisetas", is_active: true } },
  })
  await updateProductCategoriesWorkflow(container).run({
    input: { selector: { id: sweatshirts.id }, update: { name: "Moletons", is_active: false } },
  })
  await updateProductCategoriesWorkflow(container).run({
    input: { selector: { id: pants.id }, update: { name: "Calças", is_active: false } },
  })
  await updateProductCategoriesWorkflow(container).run({
    input: { selector: { id: merch.id }, update: { name: "Bonés", is_active: false } },
  })

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "title"],
  })
  const preta = products.find((p) => p.title === "Camiseta PIQUE Preta")
  const branca = products.find((p) => p.title === "Camiseta PIQUE Branca")

  if (!preta || !branca) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Não encontrei os produtos reais (rode set-real-products.ts primeiro).")
  }

  await updateProductsWorkflow(container).run({
    input: {
      products: [
        { id: preta.id, category_ids: [shirts.id] },
        { id: branca.id, category_ids: [shirts.id] },
      ],
    },
  })

  logger.info("Categorias reais definidas: Camisetas (ativa), Moletons/Calças/Bonés (em breve).")
}
