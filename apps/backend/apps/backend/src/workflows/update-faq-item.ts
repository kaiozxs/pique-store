import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { updateFaqItemStep } from "./steps/update-faq-item"

type Input = {
  id: string
  category?: string
  question?: string
  answer?: string
  position?: number
  published?: boolean
}

const updateFaqItemWorkflow = createWorkflow(
  "update-faq-item",
  function (input: Input) {
    const item = updateFaqItemStep(input)

    return new WorkflowResponse({ item })
  }
)

export default updateFaqItemWorkflow
