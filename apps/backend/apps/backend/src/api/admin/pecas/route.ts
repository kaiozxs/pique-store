import { AuthenticatedMedusaRequest, MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { VERIFICATION_MODULE } from "../../../modules/verification"
import VerificationModuleService from "../../../modules/verification/service"
import createPieceUnitsWorkflow from "../../../workflows/create-piece-units"
import { CreatePieceUnitsSchema } from "./middlewares"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const verificationService: VerificationModuleService = req.scope.resolve(VERIFICATION_MODULE)

  const filters: Record<string, string> = {}
  if (typeof req.query.product_variant_id === "string") {
    filters.product_variant_id = req.query.product_variant_id
  }
  if (typeof req.query.status === "string") {
    filters.status = req.query.status
  }

  const [pieceUnits, count] = await verificationService.listAndCountPieceUnits(filters, {
    order: { created_at: "DESC" },
  })

  return res.json({ piece_units: pieceUnits, count })
}

export async function POST(
  req: AuthenticatedMedusaRequest<CreatePieceUnitsSchema>,
  res: MedusaResponse
) {
  const { result } = await createPieceUnitsWorkflow(req.scope).run({
    input: req.validatedBody,
  })

  return res.json({ piece_units: result.pieceUnits })
}
