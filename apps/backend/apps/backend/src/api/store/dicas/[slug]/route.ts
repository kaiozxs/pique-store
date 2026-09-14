import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { DICAS_MODULE } from "../../../../modules/dicas"
import DicasModuleService from "../../../../modules/dicas/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const dicasService: DicasModuleService = req.scope.resolve(DICAS_MODULE)
  const [post] = await dicasService.listTipPosts({
    slug: req.params.slug,
    status: "published",
  })

  if (!post) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Conteúdo não encontrado.")
  }

  return res.json({
    tip_post: {
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      body: post.body,
      cover_image: post.cover_image,
      published_at: post.published_at,
    },
  })
}
