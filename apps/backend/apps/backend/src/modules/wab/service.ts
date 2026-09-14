import { MedusaService } from "@medusajs/framework/utils"
import WabContent from "./models/wab-content"

class WabModuleService extends MedusaService({
  WabContent,
}) {}

export default WabModuleService
