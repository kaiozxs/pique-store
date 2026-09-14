import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { deletePieceUnitStep } from "./steps/delete-piece-unit"

type Input = { id: string }

const deletePieceUnitWorkflow = createWorkflow(
  "delete-piece-unit",
  function (input: Input) {
    const result = deletePieceUnitStep(input)

    return new WorkflowResponse(result)
  }
)

export default deletePieceUnitWorkflow
