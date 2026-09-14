import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"
import { VERIFICATION_MODULE } from "../../modules/verification"
import VerificationModuleService from "../../modules/verification/service"

type Input = {
  transfer_id: string
  authorized_by_customer_id: string
  decision: "concluida" | "rejeitada"
}

export const authorizeOwnershipTransferStep = createStep(
  "authorize-ownership-transfer",
  async (input: Input, { container }) => {
    const verificationService: VerificationModuleService = container.resolve(VERIFICATION_MODULE)

    const transfer = await verificationService.retrieveOwnershipTransfer(input.transfer_id)

    if (transfer.status !== "pendente") {
      throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Esta transferência já foi resolvida.")
    }

    // Regra de negócio central: só o titular atual (from_customer_id) pode autorizar.
    if (transfer.from_customer_id !== input.authorized_by_customer_id) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Somente o titular atual da peça pode autorizar esta transferência."
      )
    }

    const updatedTransfer = await verificationService.updateOwnershipTransfers({
      id: transfer.id,
      status: input.decision,
      authorized_at: new Date(),
    })

    if (input.decision === "concluida") {
      await verificationService.updatePieceUnits({
        id: transfer.piece_unit_id,
        current_owner_customer_id: transfer.to_customer_id,
      })
    }

    return new StepResponse(
      { transfer: updatedTransfer },
      { transferId: transfer.id, pieceUnitId: transfer.piece_unit_id, previousOwnerId: transfer.from_customer_id }
    )
  },
  async (compensationData, { container }) => {
    if (!compensationData) return
    const verificationService: VerificationModuleService = container.resolve(VERIFICATION_MODULE)
    await verificationService.updateOwnershipTransfers({
      id: compensationData.transferId,
      status: "pendente",
      authorized_at: null,
    })
    await verificationService.updatePieceUnits({
      id: compensationData.pieceUnitId,
      current_owner_customer_id: compensationData.previousOwnerId,
    })
  }
)
