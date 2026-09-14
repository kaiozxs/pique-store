import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { FAQ_MODULE } from "../../modules/faq"
import FaqModuleService from "../../modules/faq/service"

type Input = { id: string }

export const deleteFaqItemStep = createStep(
  "delete-faq-item",
  async (input: Input, { container }) => {
    const faqService: FaqModuleService = container.resolve(FAQ_MODULE)
    await faqService.deleteFaqItems(input.id)

    return new StepResponse({ id: input.id })
  }
)
