import { MedusaService } from "@medusajs/framework/utils"
import HomeSection from "./models/home-section"

class HomeConfigModuleService extends MedusaService({
  HomeSection,
}) {}

export default HomeConfigModuleService
