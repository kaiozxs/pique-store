import WabModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const WAB_MODULE = "wab"

export default Module(WAB_MODULE, {
  service: WabModuleService,
})
