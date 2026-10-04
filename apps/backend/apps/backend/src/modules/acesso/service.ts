import { MedusaService } from "@medusajs/framework/utils"
import Acesso from "./models/acesso"

class AcessoModuleService extends MedusaService({
  Acesso,
}) {}

export default AcessoModuleService
