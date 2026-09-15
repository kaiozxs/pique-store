import { model } from "@medusajs/framework/utils"
import DropWeekItem from "./drop-week-item"

// Singleton, como o book_content: representa o drop da semana atual.
const DropWeek = model.define("drop_week", {
  id: model.id().primaryKey(),
  title: model.text().nullable(),
  status: model.enum(["draft", "published"]).default("draft"),
  items: model.hasMany(() => DropWeekItem, {
    mappedBy: "drop_week",
  }),
})

export default DropWeek
