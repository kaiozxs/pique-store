import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { upsertDropWeekStep } from "./steps/upsert-drop-week"

type Input = {
  title?: string | null
  status?: "draft" | "published"
  product_ids: string[]
}

const upsertDropWeekWorkflow = createWorkflow(
  "upsert-drop-week",
  function (input: Input) {
    const result = upsertDropWeekStep(input)

    return new WorkflowResponse(result)
  }
)

export default upsertDropWeekWorkflow
