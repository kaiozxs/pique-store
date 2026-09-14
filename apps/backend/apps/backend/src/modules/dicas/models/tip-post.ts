import { model } from "@medusajs/framework/utils"

const TipPost = model.define("tip_post", {
  id: model.id().primaryKey(),
  title: model.text(),
  slug: model.text().unique(),
  excerpt: model.text().nullable(),
  body: model.text(),
  cover_image: model.text().nullable(),
  status: model.enum(["draft", "published"]).default("draft"),
  published_at: model.dateTime().nullable(),
})

export default TipPost
