import { MedusaService } from "@medusajs/framework/utils"
import TipPost from "./models/tip-post"

class DicasModuleService extends MedusaService({
  TipPost,
}) {}

export default DicasModuleService
