import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import crypto from "crypto"
import { VERIFICATION_MODULE } from "../../modules/verification"
import VerificationModuleService from "../../modules/verification/service"

type Input = {
  product_variant_id: string
  quantity: number
  // Quando vem de uma compra, a peça já nasce no nome de quem comprou.
  customer_id?: string | null
  order_id?: string | null
}

// Código público, não sequencial: 12 caracteres em maiúsculo, sem 0/O/1/I
// pra evitar confusão na hora de digitar.
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

function generateUniqueCode(): string {
  const bytes = crypto.randomBytes(12)
  let code = ""
  for (let i = 0; i < 12; i++) {
    code += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length]
    if (i === 3 || i === 7) code += "-"
  }
  return code
}

export const createPieceUnitsStep = createStep(
  "create-piece-units",
  async (input: Input, { container }) => {
    const verificationService: VerificationModuleService = container.resolve(VERIFICATION_MODULE)

    const records = Array.from({ length: input.quantity }, () => ({
      product_variant_id: input.product_variant_id,
      unique_code: generateUniqueCode(),
      ...(input.customer_id
        ? { status: "registrado" as const, current_owner_customer_id: input.customer_id }
        : {}),
      ...(input.order_id ? { order_id: input.order_id } : {}),
    }))

    const created = await verificationService.createPieceUnits(records)

    return new StepResponse(
      created,
      created.map((c) => c.id)
    )
  },
  async (createdIds, { container }) => {
    if (!createdIds) return
    const verificationService: VerificationModuleService = container.resolve(VERIFICATION_MODULE)
    await verificationService.deletePieceUnits(createdIds)
  }
)
