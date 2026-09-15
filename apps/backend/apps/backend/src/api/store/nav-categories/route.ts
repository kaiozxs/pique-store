import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

// A Store API nativa de categorias (`/store/product-categories`) só devolve
// categorias com `is_active: true` — não dá pra usar pra montar o mega-menu
// com categorias "em breve" (inativas, sem produto ainda). Essa rota devolve
// todas, com uma contagem de produtos publicados por categoria.
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: categories } = await query.graph({
    entity: "product_category",
    fields: ["id", "name", "handle", "is_active", "is_internal", "rank"],
    filters: { is_internal: false },
  })

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "status", "categories.id"],
    filters: { status: "published" },
  })

  const countByCategoryId = new Map<string, number>()
  for (const product of products) {
    for (const category of product.categories ?? []) {
      countByCategoryId.set(category.id, (countByCategoryId.get(category.id) ?? 0) + 1)
    }
  }

  const nav_categories = [...categories]
    .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
    .map((c) => ({
      id: c.id,
      name: c.name,
      handle: c.handle,
      product_count: countByCategoryId.get(c.id) ?? 0,
      available: c.is_active && (countByCategoryId.get(c.id) ?? 0) > 0,
    }))

  return res.json({ nav_categories })
}
