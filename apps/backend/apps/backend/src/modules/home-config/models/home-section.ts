import { model } from "@medusajs/framework/utils"

// Uma linha por seção real da Home (não é uma lista livre de blocos) —
// cada `type` existe no máximo uma vez, o admin só ajusta ordem,
// visibilidade e, pra hero/apresentacao, o texto.
const HomeSection = model.define("home_section", {
  id: model.id().primaryKey(),
  type: model
    .enum(["hero", "drop_destaque", "wab_teaser", "dicas_destaque", "apresentacao"])
    .unique(),
  position: model.number().default(0),
  visible: model.boolean().default(true),
  config: model.json().nullable(),
})

export default HomeSection
