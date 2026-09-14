import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { deleteFaqItemStep } from "./steps/delete-faq-item"

type Input = { id: string }

const deleteFaqItemWorkflow = createWorkflow(
  "delete-faq-item",
  function (input: Input) {
    const result = deleteFaqItemStep(input)

    return new WorkflowResponse(result)
  }
)

export default deleteFaqItemWorkflow
