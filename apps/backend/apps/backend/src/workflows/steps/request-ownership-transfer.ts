import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"
import { VERIFICATION_MODULE } from "../../modules/verification"
import VerificationModuleService from "../../modules/verification/service"

type Input = {
  unique_code: string
  to_customer_id: string
}

export const requestOwnershipTransferStep = createStep(
  "request-ownership-transfer",
  async (input: Input, { container }) => {
    const verificationService: VerificationModuleService = container.resolve(VERIFICATION_MODULE)

    const [piece] = await verificationService.listPieceUnits({
      unique_code: input.unique_code,
    })

    if (!piece) {
      throw new MedusaError(MedusaError.Types.NOT_FOUND, "Código de peça não encontrado.")
    }

    if (piece.status !== "registrado") {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Só é possível transferir uma peça já registrada."
      )
    }

    if (piece.current_owner_customer_id === input.to_customer_id) {
      throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Você já é o titular desta peça.")
    }

    const pendingTransfers = await verificationService.listOwnershipTransfers({
      piece_unit_id: piece.id,
      status: "pendente",
    })

    if (pendingTransfers.length > 0) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Já existe uma transferência pendente para esta peça."
      )
    }

    const [transfer] = await verificationService.createOwnershipTransfers([
      {
        piece_unit_id: piece.id,
        from_customer_id: piece.current_owner_customer_id,
        to_customer_id: input.to_customer_id,
        status: "pendente",
      },
    ])

    return new StepResponse(transfer, transfer.id)
  },
  async (transferId, { container }) => {
    if (!transferId) return
    const verificationService: VerificationModuleService = container.resolve(VERIFICATION_MODULE)
    await verificationService.deleteOwnershipTransfers(transferId)
  }
)
