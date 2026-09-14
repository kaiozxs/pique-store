import { MedusaService } from "@medusajs/framework/utils"
import DropWeek from "./models/drop-week"
import DropWeekItem from "./models/drop-week-item"

class DropSemanaModuleService extends MedusaService({
  DropWeek,
  DropWeekItem,
}) {}

export default DropSemanaModuleService
