import { model } from "@medusajs/framework/utils"

const WabContent = model.define("wab_content", {
  id: model.id().primaryKey(),
  status: model
    .enum(["em_construcao", "revelado", "oculto"])
    .default("em_construcao"),
  title: model.text().nullable(),
  body: model.text().nullable(),
  media: model.json().nullable(),
})

export default WabContent
