import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import vincularEtiquetaWorkflow from "../../../../workflows/vincular-etiqueta"
import { VincularEtiquetaSchema } from "../middlewares"

// Painel → "Vincular etiquetas": grava para sempre qual peça é aquele QR.
export async function POST(req: AuthenticatedMedusaRequest<VincularEtiquetaSchema>, res: MedusaResponse) {
  const { result } = await vincularEtiquetaWorkflow(req.scope).run({ input: req.validatedBody })
  return res.json({ piece_unit: result.peca })
}
