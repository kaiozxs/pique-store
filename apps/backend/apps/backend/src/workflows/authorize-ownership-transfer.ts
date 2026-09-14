import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { authorizeOwnershipTransferStep } from "./steps/authorize-ownership-transfer"

type Input = {
  transfer_id: string
  authorized_by_customer_id: string
  decision: "concluida" | "rejeitada"
}

const authorizeOwnershipTransferWorkflow = createWorkflow(
  "authorize-ownership-transfer",
  function (input: Input) {
    const result = authorizeOwnershipTransferStep(input)

    return new WorkflowResponse(result)
  }
)

export default authorizeOwnershipTransferWorkflow
