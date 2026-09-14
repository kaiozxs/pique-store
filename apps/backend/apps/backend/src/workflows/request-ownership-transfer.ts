import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { requestOwnershipTransferStep } from "./steps/request-ownership-transfer"

type Input = {
  unique_code: string
  to_customer_id: string
}

const requestOwnershipTransferWorkflow = createWorkflow(
  "request-ownership-transfer",
  function (input: Input) {
    const transfer = requestOwnershipTransferStep(input)

    return new WorkflowResponse({ transfer })
  }
)

export default requestOwnershipTransferWorkflow
