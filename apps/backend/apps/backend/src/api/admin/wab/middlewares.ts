import { MiddlewareRoute, validateAndTransformBody } from "@medusajs/framework"
import { z } from "@medusajs/framework/zod"

export const UpsertWabContentSchema = z.object({
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

export type UpsertWabContentSchema = z.infer<typeof UpsertWabContentSchema>

export const wabAdminMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/admin/wab",
    method: "POST",
    middlewares: [validateAndTransformBody(UpsertWabContentSchema)],
  },
]
