import { model } from "@medusajs/framework/utils"

// Categoria é texto livre (não uma tabela própria) — o admin agrupa por
// categoria só digitando o mesmo nome em itens relacionados.
const FaqItem = model.define("faq_item", {
  id: model.id().primaryKey(),
  category: model.text(),
  question: model.text(),
  answer: model.text(),
  position: model.number().default(0),
  published: model.boolean().default(true),
})

export default FaqItem
