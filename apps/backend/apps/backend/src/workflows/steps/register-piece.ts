import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"
import { VERIFICATION_MODULE } from "../../modules/verification"
import VerificationModuleService from "../../modules/verification/service"

type Input = {
  unique_code: string
  customer_id: string
}

export const registerPieceStep = createStep(
  "register-piece",
  async (input: Input, { container }) => {
    const verificationService: VerificationModuleService = container.resolve(VERIFICATION_MODULE)

    const [piece] = await verificationService.listPieceUnits({
      unique_code: input.unique_code,
    })

    if (!piece) {
      throw new MedusaError(MedusaError.Types.NOT_FOUND, "Código de peça não encontrado.")
    }

    if (piece.status !== "nao_registrado") {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Esta peça já foi registrada. Use a transferência de titularidade."
      )
    }

    const updated = await verificationService.updatePieceUnits({
      id: piece.id,
      status: "registrado",
      current_owner_customer_id: input.customer_id,
    })

    const [transfer] = await verificationService.createOwnershipTransfers([
      {
        piece_unit_id: piece.id,
        from_customer_id: null,
        to_customer_id: input.customer_id,
        status: "concluida",
        authorized_at: new Date(),
      },
    ])

    return new StepResponse(
      { piece: updated, transfer },
      { pieceId: piece.id, transferId: transfer.id }
    )
  },
  async (compensationData, { container }) => {
    if (!compensationData) return
    const verificationService: VerificationModuleService = container.resolve(VERIFICATION_MODULE)
    await verificationService.updatePieceUnits({
      id: compensationData.pieceId,
      status: "nao_registrado",
      current_owner_customer_id: null,
    })
    await verificationService.deleteOwnershipTransfers(compensationData.transferId)
  }
)
