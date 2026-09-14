import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { upsertHomeSectionsStep } from "./steps/upsert-home-sections"

type SectionType = "hero" | "drop_destaque" | "wab_teaser" | "dicas_destaque" | "apresentacao"

type Input = {
  sections: {
    type: SectionType
    position: number
    visible: boolean
    config?: Record<string, unknown> | null
  }[]
}

const upsertHomeSectionsWorkflow = createWorkflow(
  "upsert-home-sections",
  function (input: Input) {
    const sections = upsertHomeSectionsStep(input)

    return new WorkflowResponse({ sections })
  }
)

export default upsertHomeSectionsWorkflow
