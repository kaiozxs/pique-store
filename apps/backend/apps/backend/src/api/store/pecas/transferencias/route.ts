import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import requestOwnershipTransferWorkflow from "../../../../workflows/request-ownership-transfer"
import { RequestTransferSchema } from "../middlewares"

export async function POST(
  req: AuthenticatedMedusaRequest<RequestTransferSchema>,
  res: MedusaResponse
) {
  const { result } = await requestOwnershipTransferWorkflow(req.scope).run({
    input: {
      unique_code: req.validatedBody.unique_code.trim().toUpperCase(),
      to_customer_id: req.auth_context.actor_id,
    },
  })

  return res.json(result)
}
