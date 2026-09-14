import HomeConfigModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const HOME_CONFIG_MODULE = "homeConfig"

export default Module(HOME_CONFIG_MODULE, {
  service: HomeConfigModuleService,
})
