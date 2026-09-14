import { model } from "@medusajs/framework/utils"
import DropWeek from "./drop-week"

const DropWeekItem = model.define("drop_week_item", {
  id: model.id().primaryKey(),
  drop_week: model.belongsTo(() => DropWeek, {
    mappedBy: "items",
  }),
  // Guardado como id simples (não module link) — só precisamos exibir o
  // produto na ordem escolhida, sem joins ou cascatas de exclusão.
  product_id: model.text(),
  position: model.number(),
})

export default DropWeekItem
