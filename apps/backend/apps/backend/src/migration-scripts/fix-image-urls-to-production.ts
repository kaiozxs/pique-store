import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows"

// Script pontual: as fotos de produto foram enviadas rodando localmente, e o
// provider de arquivo local grava a URL pública com o host de quem fez o
// upload — ficou "http://localhost:9000/static/..." salvo pra sempre no
// banco. Isso quebra em produção (ninguém de fora acessa seu localhost).
// Troca esse prefixo pela URL pública de verdade (ex: a do Railway).
// Rodar com: npx medusa exec ./src/migration-scripts/fix-image-urls-to-production.ts
const OLD_PREFIX = "http://localhost:9000/static"
const NEW_PREFIX = `${process.env.MEDUSA_BACKEND_URL}/static`

export default async function fixImageUrlsToProduction({ container }: { container: MedusaContainer }) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  if (!process.env.MEDUSA_BACKEND_URL) {
    throw new Error("MEDUSA_BACKEND_URL não está definida — configure antes de rodar esse script.")
  }

  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "title", "thumbnail", "images.id", "images.url"],
  })

  const updates = products
    .map((product) => {
      const thumbnailNeedsFix = product.thumbnail?.startsWith(OLD_PREFIX)
      const images = product.images ?? []
      const anyImageNeedsFix = images.some((img: any) => img.url?.startsWith(OLD_PREFIX))

      if (!thumbnailNeedsFix && !anyImageNeedsFix) return null

      return {
        id: product.id,
        title: product.title,
        ...(thumbnailNeedsFix
          ? { thumbnail: product.thumbnail!.replace(OLD_PREFIX, NEW_PREFIX) }
          : {}),
        ...(anyImageNeedsFix
          ? {
              images: images.map((img: any) => ({
                url: img.url?.startsWith(OLD_PREFIX) ? img.url.replace(OLD_PREFIX, NEW_PREFIX) : img.url,
              })),
            }
          : {}),
      }
    })
    .filter((u): u is NonNullable<typeof u> => u !== null)

  if (updates.length === 0) {
    logger.info("Nenhuma URL de imagem precisando de correção — nada a fazer.")
    return
  }

  await updateProductsWorkflow(container).run({
    input: { products: updates.map(({ title, ...rest }) => rest) },
  })

  logger.info(`URLs de imagem corrigidas pra ${NEW_PREFIX} em: ${updates.map((u) => u.title).join(", ")}`)
}
