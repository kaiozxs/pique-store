import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { DICAS_MODULE } from "../../modules/dicas"
import DicasModuleService from "../../modules/dicas/service"

type Input = { id: string }

export const deleteTipPostStep = createStep(
  "delete-tip-post",
  async (input: Input, { container }) => {
    const dicasService: DicasModuleService = container.resolve(DICAS_MODULE)
    await dicasService.deleteTipPosts(input.id)

    return new StepResponse({ id: input.id })
  }
)
