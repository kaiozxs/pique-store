import { MiddlewareRoute, validateAndTransformBody } from "@medusajs/framework"
import { z } from "@medusajs/framework/zod"

export const CreateTipPostSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().nullable().optional(),
  body: z.string().min(1),
  cover_image: z.string().nullable().optional(),
  status: z.enum(["draft", "published"]).default("draft"),
})
export type CreateTipPostSchema = z.infer<typeof CreateTipPostSchema>

export const UpdateTipPostSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  excerpt: z.string().nullable().optional(),
  body: z.string().min(1).optional(),
  cover_image: z.string().nullable().optional(),
  status: z.enum(["draft", "published"]).optional(),
})
export type UpdateTipPostSchema = z.infer<typeof UpdateTipPostSchema>

export const dicasAdminMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/admin/dicas",
    method: "POST",
    middlewares: [validateAndTransformBody(CreateTipPostSchema)],
  },
  {
    matcher: "/admin/dicas/:id",
    method: "POST",
    middlewares: [validateAndTransformBody(UpdateTipPostSchema)],
  },
]
