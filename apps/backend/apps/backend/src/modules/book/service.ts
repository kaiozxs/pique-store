import { MedusaService } from "@medusajs/framework/utils"
import BookContent from "./models/book-content"

class BookModuleService extends MedusaService({
  BookContent,
}) {}

export default BookModuleService
