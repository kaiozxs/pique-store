import { model } from "@medusajs/framework/utils"

// Tabela mantida como "wab_content" (nome antigo da feature, "WAB") pra não
// precisar de uma migração de rename — o nome novo "BOOK" vive só no
// código/UI a partir daqui.
const BookContent = model.define("wab_content", {
  id: model.id().primaryKey(),
  status: model
    .enum(["em_construcao", "revelado", "oculto"])
    .default("em_construcao"),
  title: model.text().nullable(),
  body: model.text().nullable(),
  media: model.json().nullable(),
})

export default BookContent
