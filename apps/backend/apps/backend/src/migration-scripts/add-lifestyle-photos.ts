import * as fs from "fs"
import * as path from "path"
import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { uploadFilesWorkflow, updateProductsWorkflow } from "@medusajs/medusa/core-flows"

// Adiciona fotos de modelo (lifestyle) no carrossel dos 2 produtos reais, sem
// perder as fotos de produto já cadastradas (a atualização de `images`
// substitui a lista inteira, então reaproveitamos os ids existentes).
// Rodar com: npx medusa exec ./src/migration-scripts/add-lifestyle-photos.ts
const MODELOS_DIR = path.resolve(__dirname, "../../../../../../design/foto de modelos")

function readAsBase64(filePath: string): string {
  return fs.readFileSync(filePath).toString("base64")
}

export default async function addLifestylePhotos({ container }: { container: MedusaContainer }) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  if (!fs.existsSync(MODELOS_DIR)) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, `Pasta não encontrada em ${MODELOS_DIR}`)
  }

  const pretaLifestyle = [
    { filename: "lifestyle-preta-01.png", source: "ChatGPT Image 14 de set. de 2026, 14_33_24.png" },
    { filename: "lifestyle-preta-02.png", source: "ChatGPT Image 14 de set. de 2026, 14_43_56.png" },
    { filename: "lifestyle-preta-03.png", source: "ChatGPT Image 14 de set. de 2026, 14_50_24.png" },
  ]
  const brancaLifestyle = [
    { filename: "lifestyle-branca-01.png", source: "ChatGPT Image 14 de set. de 2026, 14_23_20.png" },
    { filename: "lifestyle-branca-02.png", source: "ChatGPT Image 14 de set. de 2026, 14_25_51.png" },
    { filename: "lifestyle-branca-03.png", source: "ChatGPT Image 14 de set. de 2026, 15_01_39.png" },
  ]

  async function uploadAll(files: { filename: string; source: string }[]) {
    const { result } = await uploadFilesWorkflow(container).run({
      input: {
        files: files.map((f) => ({
          filename: f.filename,
          mimeType: "image/png",
          content: readAsBase64(path.join(MODELOS_DIR, f.source)),
          access: "public",
        })),
      },
    })
    return result.map((f) => f.url)
  }

  logger.info("Fazendo upload das fotos lifestyle...")
  const pretaUrls = await uploadAll(pretaLifestyle)
  const brancaUrls = await uploadAll(brancaLifestyle)

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "title", "images.id", "images.url"],
  })

  const preta = products.find((p) => p.title === "Camiseta PIQUE Preta")
  const branca = products.find((p) => p.title === "Camiseta PIQUE Branca")

  if (!preta || !branca) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Não encontrei os produtos reais (rode set-real-products.ts primeiro).")
  }

  await updateProductsWorkflow(container).run({
    input: {
      products: [
        {
          id: preta.id,
          images: [
            ...(preta.images ?? []).map((img: any) => ({ id: img.id })),
            ...pretaUrls.map((url) => ({ url })),
          ],
        },
        {
          id: branca.id,
          images: [
            ...(branca.images ?? []).map((img: any) => ({ id: img.id })),
            ...brancaUrls.map((url) => ({ url })),
          ],
        },
      ],
    },
  })

  logger.info("Fotos lifestyle adicionadas nos carrosséis da Camiseta PIQUE Preta e Branca.")
}
