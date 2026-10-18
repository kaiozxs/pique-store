import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"
import { VERIFICATION_MODULE } from "../../modules/verification"
import VerificationModuleService from "../../modules/verification/service"

type Input = {
  unique_code: string
  product_variant_id: string
}

/**
 * Vincula uma etiqueta pré-impressa (o código do QR) a uma peça.
 *
 * É definitivo: se o código já existe, recusa. A trava mora aqui, no
 * servidor — esconder o botão no painel não bastaria.
 */
export const vincularEtiquetaStep = createStep(
  "vincular-etiqueta",
  async (input: Input, { container }) => {
    const verificationService: VerificationModuleService = container.resolve(VERIFICATION_MODULE)

    const [existente] = await verificationService.listPieceUnits({ unique_code: input.unique_code })
    if (existente) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Esta etiqueta já está vinculada a uma peça e não pode ser alterada."
      )
    }

    const [criada] = await verificationService.createPieceUnits([
      { unique_code: input.unique_code, product_variant_id: input.product_variant_id },
    ])

    return new StepResponse(criada, criada.id)
  },
  async (id, { container }) => {
    if (!id) return
    const verificationService: VerificationModuleService = container.resolve(VERIFICATION_MODULE)
    await verificationService.deletePieceUnits(id)
  }
)
