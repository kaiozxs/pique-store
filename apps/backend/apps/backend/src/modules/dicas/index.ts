import DicasModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const DICAS_MODULE = "dicas"

export default Module(DICAS_MODULE, {
  service: DicasModuleService,
})
