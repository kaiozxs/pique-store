import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { VERIFICATION_MODULE } from "../../modules/verification"
import VerificationModuleService from "../../modules/verification/service"

type Input = { id: string }

export const deletePieceUnitStep = createStep(
  "delete-piece-unit",
  async (input: Input, { container }) => {
    const verificationService: VerificationModuleService = container.resolve(VERIFICATION_MODULE)

    await verificationService.deleteOwnershipTransfers({ piece_unit_id: input.id })
    await verificationService.deletePieceUnits(input.id)

    return new StepResponse({ id: input.id })
  }
)
