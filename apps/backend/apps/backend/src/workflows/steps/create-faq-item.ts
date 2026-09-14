import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { FAQ_MODULE } from "../../modules/faq"
import FaqModuleService from "../../modules/faq/service"

type Input = {
  category: string
  question: string
  answer: string
  position?: number
  published?: boolean
}

export const createFaqItemStep = createStep(
  "create-faq-item",
  async (input: Input, { container }) => {
    const faqService: FaqModuleService = container.resolve(FAQ_MODULE)
    const [item] = await faqService.createFaqItems([input])

    return new StepResponse(item, item.id)
  },
  async (id, { container }) => {
    if (!id) return
    const faqService: FaqModuleService = container.resolve(FAQ_MODULE)
    await faqService.deleteFaqItems(id)
  }
)
