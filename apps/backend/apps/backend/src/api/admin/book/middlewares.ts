import { MiddlewareRoute, validateAndTransformBody } from "@medusajs/framework"
import { z } from "@medusajs/framework/zod"

export const UpsertBookContentSchema = z.object({
  status: z.enum(["em_construcao", "revelado", "oculto"]).optional(),
  title: z.string().nullable().optional(),
  body: z.string().nullable().optional(),
  media: z
    .object({
      items: z.array(
        z.object({
          url: z.url(),
          type: z.enum(["image", "video"]),
        })
      ),
    })
    .nullable()
    .optional(),
})

export type UpsertBookContentSchema = z.infer<typeof UpsertBookContentSchema>

export const bookAdminMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/admin/book",
    method: "POST",
    middlewares: [validateAndTransformBody(UpsertBookContentSchema)],
  },
]
