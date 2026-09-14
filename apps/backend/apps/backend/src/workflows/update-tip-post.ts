import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { updateTipPostStep } from "./steps/update-tip-post"

type Input = {
  id: string
  title?: string
  slug?: string
  excerpt?: string | null
  body?: string
  cover_image?: string | null
  status?: "draft" | "published"
}

const updateTipPostWorkflow = createWorkflow(
  "update-tip-post",
  function (input: Input) {
    const post = updateTipPostStep(input)

    return new WorkflowResponse({ post })
  }
)

export default updateTipPostWorkflow
