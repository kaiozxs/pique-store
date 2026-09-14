import DropSemanaModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const DROP_SEMANA_MODULE = "dropSemana"

export default Module(DROP_SEMANA_MODULE, {
  service: DropSemanaModuleService,
})
