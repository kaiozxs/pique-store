import { model } from "@medusajs/framework/utils"

// Quem pode entrar no painel com o login da loja.
//
// Mora numa tabela própria, e não no `metadata` do cliente, de propósito: o
// cliente consegue editar o próprio metadata pela API pública, então um papel
// guardado ali seria autoconcedido por qualquer pessoa.
const Acesso = model.define("acesso_painel", {
  id: model.id().primaryKey(),
  customer_id: model.text().unique(),
  papel: model.enum(["dono", "lojista"]),
  concedido_por: model.text().nullable(),
})

export default Acesso
