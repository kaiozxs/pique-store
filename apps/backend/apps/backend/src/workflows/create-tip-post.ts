import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { createTipPostStep } from "./steps/create-tip-post"

type Input = {
  title: string
  slug: string
  excerpt?: string | null
  body: string
  cover_image?: string | null
  status: "draft" | "published"
}

const createTipPostWorkflow = createWorkflow(
  "create-tip-post",
  function (input: Input) {
    const post = createTipPostStep(input)

    return new WorkflowResponse({ post })
  }
)

export default createTipPostWorkflow
