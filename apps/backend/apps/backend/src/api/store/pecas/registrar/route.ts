import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import registerPieceWorkflow from "../../../../workflows/register-piece"
import { RegisterPieceSchema } from "../middlewares"

export async function POST(
  req: AuthenticatedMedusaRequest<RegisterPieceSchema>,
  res: MedusaResponse
) {
  const { result } = await registerPieceWorkflow(req.scope).run({
    input: {
      unique_code: req.validatedBody.unique_code.trim().toUpperCase(),
      customer_id: req.auth_context.actor_id,
    },
  })

  return res.json(result)
}
