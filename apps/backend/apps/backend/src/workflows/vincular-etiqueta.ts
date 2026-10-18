import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { vincularEtiquetaStep } from "./steps/vincular-etiqueta"

type Input = {
  unique_code: string
  product_variant_id: string
}

const vincularEtiquetaWorkflow = createWorkflow("vincular-etiqueta", function (input: Input) {
  const peca = vincularEtiquetaStep(input)
  return new WorkflowResponse({ peca })
})

export default vincularEtiquetaWorkflow
