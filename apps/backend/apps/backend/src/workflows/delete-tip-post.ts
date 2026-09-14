import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { deleteTipPostStep } from "./steps/delete-tip-post"

type Input = { id: string }

const deleteTipPostWorkflow = createWorkflow(
  "delete-tip-post",
  function (input: Input) {
    const result = deleteTipPostStep(input)

    return new WorkflowResponse(result)
  }
)

export default deleteTipPostWorkflow
