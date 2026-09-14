import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { VERIFICATION_MODULE } from "../../../../modules/verification"
import VerificationModuleService from "../../../../modules/verification/service"
import deletePieceUnitWorkflow from "../../../../workflows/delete-piece-unit"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const verificationService: VerificationModuleService = req.scope.resolve(VERIFICATION_MODULE)
  const { id } = req.params

  const pieceUnit = await verificationService.retrievePieceUnit(id).catch(() => null)
  if (!pieceUnit) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Peça não encontrada.")
  }

  const transfers = await verificationService.listOwnershipTransfers(
    { piece_unit_id: id },
    { order: { created_at: "DESC" } }
  )

  return res.json({ piece_unit: pieceUnit, transfers })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  await deletePieceUnitWorkflow(req.scope).run({ input: { id } })

  return res.json({ id, deleted: true })
}
