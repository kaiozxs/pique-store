import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import authorizeOwnershipTransferWorkflow from "../../../../../../workflows/authorize-ownership-transfer"
import { AuthorizeTransferSchema } from "../../../middlewares"

export async function POST(
  req: AuthenticatedMedusaRequest<AuthorizeTransferSchema>,
  res: MedusaResponse
) {
  const { result } = await authorizeOwnershipTransferWorkflow(req.scope).run({
    input: {
      transfer_id: req.params.id,
      authorized_by_customer_id: req.auth_context.actor_id,
      decision: req.validatedBody.decision,
    },
  })

  return res.json(result)
}
