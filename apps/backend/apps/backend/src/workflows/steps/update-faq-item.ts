import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { FAQ_MODULE } from "../../modules/faq"
import FaqModuleService from "../../modules/faq/service"

type Input = {
  id: string
  category?: string
  question?: string
  answer?: string
  position?: number
  published?: boolean
}

export const updateFaqItemStep = createStep(
  "update-faq-item",
  async (input: Input, { container }) => {
    const faqService: FaqModuleService = container.resolve(FAQ_MODULE)
    const previous = await faqService.retrieveFaqItem(input.id)

    const item = await faqService.updateFaqItems(input)

    return new StepResponse(item, {
      id: previous.id,
      category: previous.category,
      question: previous.question,
      answer: previous.answer,
      position: previous.position,
      published: previous.published,
    })
  },
  async (previous, { container }) => {
    if (!previous) return
    const faqService: FaqModuleService = container.resolve(FAQ_MODULE)
    await faqService.updateFaqItems(previous)
  }
)
