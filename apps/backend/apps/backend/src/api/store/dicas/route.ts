import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { DICAS_MODULE } from "../../../modules/dicas"
import DicasModuleService from "../../../modules/dicas/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const dicasService: DicasModuleService = req.scope.resolve(DICAS_MODULE)
  const posts = await dicasService.listTipPosts(
    { status: "published" },
    { order: { published_at: "DESC" } }
  )

  return res.json({
    tip_posts: posts.map((p) => ({
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      cover_image: p.cover_image,
      published_at: p.published_at,
    })),
  })
}
