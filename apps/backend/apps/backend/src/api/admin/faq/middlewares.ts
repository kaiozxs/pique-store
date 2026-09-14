import { MiddlewareRoute, validateAndTransformBody } from "@medusajs/framework"
import { z } from "@medusajs/framework/zod"

export const CreateFaqItemSchema = z.object({
  category: z.string().min(1),
  question: z.string().min(1),
  answer: z.string().min(1),
  position: z.number().int().optional(),
  published: z.boolean().default(true),
})
export type CreateFaqItemSchema = z.infer<typeof CreateFaqItemSchema>

export const UpdateFaqItemSchema = z.object({
  category: z.string().min(1).optional(),
  question: z.string().min(1).optional(),
  answer: z.string().min(1).optional(),
  position: z.number().int().optional(),
  published: z.boolean().optional(),
})
export type UpdateFaqItemSchema = z.infer<typeof UpdateFaqItemSchema>

export const faqAdminMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/admin/faq",
    method: "POST",
    middlewares: [validateAndTransformBody(CreateFaqItemSchema)],
  },
  {
    matcher: "/admin/faq/:id",
    method: "POST",
    middlewares: [validateAndTransformBody(UpdateFaqItemSchema)],
  },
]
