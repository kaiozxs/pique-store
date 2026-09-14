import { MedusaService } from "@medusajs/framework/utils"
import PieceUnit from "./models/piece-unit"
import OwnershipTransfer from "./models/ownership-transfer"

class VerificationModuleService extends MedusaService({
  PieceUnit,
  OwnershipTransfer,
}) {}

export default VerificationModuleService
