import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { upsertWabContentStep } from "./steps/upsert-wab-content"

type WabMedia = { url: string; type: "image" | "video" }
type WabMediaJson = { items: WabMedia[] }

type Input = {
  status?: "em_construcao" | "revelado" | "oculto"
  title?: string | null
  body?: string | null
  media?: WabMediaJson | null
}

const upsertWabContentWorkflow = createWorkflow(
  "upsert-wab-content",
  function (input: Input) {
    const wabContent = upsertWabContentStep(input)

    return new WorkflowResponse({ wabContent })
  }
)

export default upsertWabContentWorkflow
