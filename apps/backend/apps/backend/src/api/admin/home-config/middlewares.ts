import { MiddlewareRoute, validateAndTransformBody } from "@medusajs/framework"
import { z } from "@medusajs/framework/zod"

const SECTION_TYPES = ["hero", "drop_destaque", "wab_teaser", "dicas_destaque", "apresentacao"] as const

export const UpsertHomeSectionsSchema = z.object({
  sections: z.array(
    z.object({
      type: z.enum(SECTION_TYPES),
      position: z.number().int(),
      visible: z.boolean(),
      config: z.record(z.string(), z.unknown()).nullable().optional(),
    })
  ),
})

export type UpsertHomeSectionsSchema = z.infer<typeof UpsertHomeSectionsSchema>

export const homeConfigAdminMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/admin/home-config",
    method: "POST",
    middlewares: [validateAndTransformBody(UpsertHomeSectionsSchema)],
  },
]
