import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { registerPieceStep } from "./steps/register-piece"

type Input = {
  unique_code: string
  customer_id: string
}

const registerPieceWorkflow = createWorkflow(
  "register-piece",
  function (input: Input) {
    const result = registerPieceStep(input)

    return new WorkflowResponse(result)
  }
)

export default registerPieceWorkflow
