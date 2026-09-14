import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { createFaqItemStep } from "./steps/create-faq-item"

type Input = {
  category: string
  question: string
  answer: string
  position?: number
  published?: boolean
}

const createFaqItemWorkflow = createWorkflow(
  "create-faq-item",
  function (input: Input) {
    const item = createFaqItemStep(input)

    return new WorkflowResponse({ item })
  }
)

export default createFaqItemWorkflow
