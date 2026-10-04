import AcessoModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const ACESSO_MODULE = "acesso"

export default Module(ACESSO_MODULE, {
  service: AcessoModuleService,
})
