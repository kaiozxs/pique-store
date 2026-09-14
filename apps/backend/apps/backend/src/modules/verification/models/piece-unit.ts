import { model } from "@medusajs/framework/utils"
import OwnershipTransfer from "./ownership-transfer"

// Referências a outros módulos (produto, cliente, pedido) são guardadas como
// IDs simples, não como module links — este módulo só precisa gravar/mostrar
// a referência, não fazer joins complexos ou cascatas de exclusão.
const PieceUnit = model.define("piece_unit", {
  id: model.id().primaryKey(),
  unique_code: model.text().unique(),
  product_variant_id: model.text(),
  serial_number: model.text().nullable(),
  status: model
    .enum(["nao_registrado", "registrado", "revogado"])
    .default("nao_registrado"),
  current_owner_customer_id: model.text().nullable(),
  order_id: model.text().nullable(),
  invoice_reference: model.text().nullable(),
  transfers: model.hasMany(() => OwnershipTransfer, {
    mappedBy: "piece_unit",
  }),
})

export default PieceUnit
