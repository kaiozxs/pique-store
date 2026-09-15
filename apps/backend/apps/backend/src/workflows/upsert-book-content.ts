import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { upsertBookContentStep } from "./steps/upsert-book-content"

type BookMedia = { url: string; type: "image" | "video" }
type BookMediaJson = { items: BookMedia[] }

type Input = {
  status?: "em_construcao" | "revelado" | "oculto"
  title?: string | null
  body?: string | null
  media?: BookMediaJson | null
}

const upsertBookContentWorkflow = createWorkflow(
  "upsert-book-content",
  function (input: Input) {
    const bookContent = upsertBookContentStep(input)

    return new WorkflowResponse({ bookContent })
  }
)

export default upsertBookContentWorkflow
