import * as fs from "fs"
import * as path from "path"
import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { uploadFilesWorkflow, updateProductsWorkflow } from "@medusajs/medusa/core-flows"

// Script pontual: troca 2 dos 4 produtos demo do seed inicial pelas fotos
// reais que o cliente mandou (frente limpa + 360° recortado em quadros), e
// esconde os outros 2 (Shorts/Sweatpants) que ainda não têm conteúdo real.
// Rodar com: npx medusa exec ./src/migration-scripts/set-real-products.ts
const DESIGN_DIR = path.resolve(__dirname, "../../../../../../design")
const FRAMES_DIR = path.join(DESIGN_DIR, "360 roupa", "frames")
const FRONTS_DIR = path.join(DESIGN_DIR, "frente camisa")

function readAsBase64(filePath: string): string {
  return fs.readFileSync(filePath).toString("base64")
}

export default async function setRealProducts({ container }: { container: MedusaContainer }) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  if (!fs.existsSync(DESIGN_DIR)) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, `Pasta design/ não encontrada em ${DESIGN_DIR}`)
  }

  const pretaFiles = [
    { filename: "preta-frente.png", source: path.join(FRONTS_DIR, "dreamina-2026-08-17-3562-Shift_the_chest_logo_from_image_1__image...-removebg-preview.png") },
    { filename: "preta-01-frente.png", source: path.join(FRAMES_DIR, "preta-01-frente.png") },
    { filename: "preta-02-direita.png", source: path.join(FRAMES_DIR, "preta-02-direita.png") },
    { filename: "preta-03-costas.png", source: path.join(FRAMES_DIR, "preta-03-costas.png") },
    { filename: "preta-04-esquerda.png", source: path.join(FRAMES_DIR, "preta-04-esquerda.png") },
    { filename: "preta-05-frente-angulo.png", source: path.join(FRAMES_DIR, "preta-05-frente-angulo.png") },
    { filename: "preta-06-direita-angulo.png", source: path.join(FRAMES_DIR, "preta-06-direita-angulo.png") },
    { filename: "preta-07-costas-angulo.png", source: path.join(FRAMES_DIR, "preta-07-costas-angulo.png") },
    { filename: "preta-08-esquerda-angulo.png", source: path.join(FRAMES_DIR, "preta-08-esquerda-angulo.png") },
  ]

  const brancaFiles = [
    { filename: "branca-frente.png", source: path.join(FRONTS_DIR, "dreamina-2026-08-17-6507-Transform_the_black_short-sleeve_t-shirt...-removebg-preview.png") },
    { filename: "branca-01-frente.png", source: path.join(FRAMES_DIR, "branca-01-frente.png") },
    { filename: "branca-02-direita.png", source: path.join(FRAMES_DIR, "branca-02-direita.png") },
    { filename: "branca-03-costas.png", source: path.join(FRAMES_DIR, "branca-03-costas.png") },
    { filename: "branca-04-esquerda.png", source: path.join(FRAMES_DIR, "branca-04-esquerda.png") },
    { filename: "branca-05-estampa.png", source: path.join(FRAMES_DIR, "branca-05-estampa.png") },
    { filename: "branca-06-tag.png", source: path.join(FRAMES_DIR, "branca-06-tag.png") },
    { filename: "branca-07-clip.png", source: path.join(FRAMES_DIR, "branca-07-clip.png") },
    { filename: "branca-08-tecido.png", source: path.join(FRAMES_DIR, "branca-08-tecido.png") },
  ]

  async function uploadAll(files: { filename: string; source: string }[]) {
    const { result } = await uploadFilesWorkflow(container).run({
      input: {
        files: files.map((f) => ({
          filename: f.filename,
          mimeType: "image/png",
          content: readAsBase64(f.source),
          access: "public",
        })),
      },
    })
    return result.map((f) => f.url)
  }

  logger.info("Fazendo upload das fotos da Camiseta PIQUE Preta...")
  const pretaUrls = await uploadAll(pretaFiles)
  logger.info("Fazendo upload das fotos da Camiseta PIQUE Branca...")
  const brancaUrls = await uploadAll(brancaFiles)

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "title"],
  })

  const sweatshirt = products.find((p) => p.title === "Medusa Sweatshirt")
  const tshirt = products.find((p) => p.title === "Medusa T-Shirt")
  const shorts = products.find((p) => p.title === "Medusa Shorts")
  const sweatpants = products.find((p) => p.title === "Medusa Sweatpants")

  if (!sweatshirt || !tshirt || !shorts || !sweatpants) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Não encontrei os 4 produtos demo esperados.")
  }

  await updateProductsWorkflow(container).run({
    input: {
      products: [
        {
          id: sweatshirt.id,
          title: "Camiseta PIQUE Preta",
          description:
            "Camiseta oversized 100% algodão com estampa exclusiva PIQUE no peito. Corte streetwear de alto padrão, caimento solto.",
          thumbnail: pretaUrls[0],
          images: pretaUrls.map((url) => ({ url })),
        },
        {
          id: tshirt.id,
          title: "Camiseta PIQUE Branca",
          description:
            "Camiseta oversized 100% algodão com estampa exclusiva PIQUE no peito. Corte streetwear de alto padrão, caimento solto.",
          thumbnail: brancaUrls[0],
          images: brancaUrls.map((url) => ({ url })),
        },
        { id: shorts.id, status: "draft" },
        { id: sweatpants.id, status: "draft" },
      ],
    },
  })

  logger.info("Produtos atualizados: Camiseta PIQUE Preta, Camiseta PIQUE Branca (Shorts/Sweatpants ocultados).")
}
