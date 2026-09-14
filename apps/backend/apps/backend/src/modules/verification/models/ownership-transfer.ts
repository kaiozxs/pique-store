import { model } from "@medusajs/framework/utils"
import PieceUnit from "./piece-unit"

const OwnershipTransfer = model.define("ownership_transfer", {
  id: model.id().primaryKey(),
  piece_unit: model.belongsTo(() => PieceUnit, {
    mappedBy: "transfers",
  }),
  from_customer_id: model.text().nullable(),
  to_customer_id: model.text(),
  status: model
    .enum(["pendente", "rejeitada", "concluida"])
    .default("pendente"),
  authorized_at: model.dateTime().nullable(),
  notes: model.text().nullable(),
})

export default OwnershipTransfer
