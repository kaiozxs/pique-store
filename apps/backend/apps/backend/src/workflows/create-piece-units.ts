import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { createPieceUnitsStep } from "./steps/create-piece-units"

type Input = {
  product_variant_id: string
  quantity: number
}

const createPieceUnitsWorkflow = createWorkflow(
  "create-piece-units",
  function (input: Input) {
    const pieceUnits = createPieceUnitsStep(input)

    return new WorkflowResponse({ pieceUnits })
  }
)

export default createPieceUnitsWorkflow
